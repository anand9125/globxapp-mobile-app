//Trade execution job: Jupiter quote → swap instructions → build CPI tx → sign & send

import pino from "pino";
import { createHash } from "node:crypto";
import { Job } from "bullmq";
import { PrismaClient } from "@repo/db";
import { buildSwapTransaction, decodeJupiterSwapInstructionForCPI, deriveMainVaultPDA, fetchJupiterQuote, getJupiterSwapInstructions, MockHSMSigner, PublicKey, SolanaClient, SwapTransactionParams } from "@repo/solana";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

const JUPITER_API_KEY = process.env.JUPITER_API_KEY;

function userIdTo32Bytes(userId: string): Buffer {
  return Buffer.from(createHash("sha256").update(userId, "utf-8").digest());
}

export interface TradeExecutionJobData {
  tradeId: string;
  userId: string;
  direction: string;
  inputTokenMint: string;
  inputAmount: string;
  outputTokenMint: string;
  slippageBps: number;
  routeType: string;
}

//Process a trade execution job: fetch Jupiter quote, get swap instructions for CPI,
//build Globx swap transaction, sign (if signer configured), and send.

export async function processTradeExecutionJob(
  job: Job<TradeExecutionJobData>,
  prisma: PrismaClient,
  solanaClient: SolanaClient,
  signer?: MockHSMSigner | null,
): Promise<{ txSignature?: string; status: string; error?: string }> {
  const {
    tradeId,
    userId,
    inputTokenMint,
    inputAmount,
    outputTokenMint,
    slippageBps,
  } = job.data;

  logger.info({ tradeId, userId }, "Processing trade execution job");

  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  if (!trade) {
    throw new Error(`Trade not found: ${tradeId}`);
  }
  if (trade.status !== "PENDING") {
    logger.warn(
      { tradeId, status: trade.status },
      "Trade no longer PENDING, skipping",
    );
    return { status: trade.status };
  }

  await prisma.trade.update({
    where: { id: tradeId },
    data: { status: "SUBMITTED" },
  });
  try {
    const [mainVault] = await deriveMainVaultPDA();
    const mainVaultAddress = mainVault.toBase58();

    const quote = await fetchJupiterQuote(
      {
        inputMint: inputTokenMint,
        outputMint: outputTokenMint,
        amount: Number(inputAmount),
        slippageBps,
      },
      { apiKey: JUPITER_API_KEY },
    );

    const swapInstructionsResponse = await getJupiterSwapInstructions(
      {
        quoteResponse: quote,
        userPublicKey: mainVaultAddress,
      },
      { apiKey: JUPITER_API_KEY },
    );

    const {
      programId: jupiterProgramId,
      accounts: jupiterAccountMetas,
      data: routeData,
    } = decodeJupiterSwapInstructionForCPI(
      swapInstructionsResponse.swapInstruction,
    );

    const amountIn = BigInt(quote.inAmount);
    const minAmountOut = BigInt(quote.otherAmountThreshold);
    const amountUsd = BigInt(0);

    const swapParams: SwapTransactionParams = {
      userId: userIdTo32Bytes(userId),
      inputMint: new PublicKey(inputTokenMint),
      outputMint: new PublicKey(outputTokenMint),
      amountIn,
      amountUsd,
      minAmountOut,
      slippageBps,
      routeType: "Jupiter",
      routeData,
    };

    const transaction = await buildSwapTransaction(
      solanaClient,
      swapParams,
      jupiterProgramId,
      jupiterAccountMetas,
    );

    if (signer) {
      const authorityPubkey = await signer.getPublicKey();
      transaction.feePayer = authorityPubkey;
      const signedTx = await signer.signTransaction(transaction);
      const raw = signedTx.serialize();
      const sig = await solanaClient.connection.sendRawTransaction(raw, {
        skipPreflight: false,
        preflightCommitment: solanaClient.commitment,
      });
      logger.info({ tradeId, signature: sig }, "Swap transaction sent");

      const slot = await solanaClient.connection.getSlot(
        solanaClient.commitment,
      );
      await prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: "EXECUTED",
          outputAmount: quote.outAmount,
          swapTxSig: sig,
          swapSlot: BigInt(slot),
          executedAt: new Date(),
        },
      });
      return { status: "EXECUTED", txSignature: sig };
    }

    logger.warn(
      { tradeId },
      "No signer configured; transaction built but not sent",
    );
    await prisma.trade.update({
      where: { id: tradeId },
      data: { status: "SUBMITTED" },
    });
    return { status: "SUBMITTED", error: "No signer configured" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ tradeId, error: message }, "Trade execution failed");
    await prisma.trade.update({
      where: { id: tradeId },
      data: { status: "FAILED", metadata: { error: message } as object },
    });
    return { status: "FAILED", error: message };
  }
}

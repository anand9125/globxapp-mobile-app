// Deposit Routes
import { randomBytes } from "node:crypto";
import { Router, Request, Response } from "express";
import {
  buildUserToDepositTransaction,
  deriveDepositVaultPDA,
  deriveVaultTokenAccountPDA,
  PublicKey,
  SolanaClient,
} from "@repo/solana";
import {
  prepareDepositSchema,
  submitDepositSchema,
} from "../../schemas/deposits";
import type { PrismaClient } from "@repo/db";

export function createDepositRouter(
  prisma: PrismaClient,
  solanaClient: SolanaClient,
): Router {
  //POST /v1/deposits/prepare
  //Generate deposit address and instructions

  const router = Router();

  router.post("/prepare", async (req: Request, res: Response) => {
    try {
      const body = prepareDepositSchema.parse(req.body);
      const user = (req as any).user;

      const depositIdBytes = randomBytes(32);
      const depositIdHex = depositIdBytes.toString("hex");
      const recordId = crypto.randomUUID();
      const [depositVault] = await deriveDepositVaultPDA();
      const tokenMintPubkey = new PublicKey(body.tokenMint);
      const vaultTokenAccount = await deriveVaultTokenAccountPDA(
        depositVault,
        tokenMintPubkey,
      );
      const amountBigInt = BigInt(body.amount);
      const deposit = await prisma.deposit.create({
        data: {
          id: recordId,
          userId: user.id,
          tokenMint: body.tokenMint,
          amount: body.amount,
          status: "PENDING",
          depositId: depositIdHex,
        },
      });

      const response: Record<string, unknown> = {
        depositId: deposit.id,
        depositIdHex,
        tokenMint: deposit.tokenMint,
        amount: deposit.amount.toString(),
        status: deposit.status,
        depositVaultAddress: depositVault.toBase58(),
        vaultTokenAccountAddress: vaultTokenAccount.toBase58(),
      };
      if (body.userSourceAccount) {
        try {
          const tx = await buildUserToDepositTransaction(solanaClient, {
            userSourceAddress: new PublicKey(body.userSourceAccount),
            tokenMint: tokenMintPubkey,
            amount: amountBigInt,
            depositId: depositIdBytes,
          });
          const serialized = tx.serialize({ requireAllSignatures: false });
          response.transactionBase64 =
            Buffer.from(serialized).toString("base64");
        } catch (txErr) {
          console.error("Failed to build deposit transaction:", txErr);
          // Still return vault addresses; client can build tx themselves
        }
      }
      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: error,
        });
      }

      console.error("Error preparing deposit:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to prepare deposit",
      });
    }
  });

  //POST /v1/deposits/submit
  //Submit deposit transaction signature for processing

  router.post("/submit", async (req: Request, res: Response) => {
    try {
      const body = submitDepositSchema.parse(req.body);
      const user = (req as any).user;

      const deposit = await prisma.deposit.findUnique({
        where: { id: body.depositId },
      });

      if (!deposit) {
        return res.status(404).json({
          error: "NOT_FOUND",
          message: "Deposit not found",
        });
      }

      if (deposit.userId !== user.id) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message: "Deposit belongs to different user",
        });
      }

      await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          onChainTxSig: body.txSignature,
          status: "PROCESSING",
        },
      });
      res.json({
        depositId: deposit.id,
        status: "PROCESSING",
        message: "Deposit submitted for processing",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid request body",
        });
      }

      console.error("Error submitting deposit:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to submit deposit",
      });
    }
  });
  return router;
}

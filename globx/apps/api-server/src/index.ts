/**
 * API server entry point
 */
import "dotenv/config";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { createServer } from "@repo/api";
import { prisma } from "@repo/db";
import { LedgerService } from "@repo/ledger";
import {
  Keypair,
  PublicKey,
  SolanaClient,
  buildWithdrawalToUserTransaction,
  MockHSMSigner,
} from "@repo/solana";
import { IndexerService } from "@repo/indexer";
import { Queue, Worker } from "bullmq";
import { processReconciliationJob, processTradeExecutionJob } from "@repo/queue";
import Redis from "ioredis";
import { createServer as createHttpServer } from "http";

// Supported tokenized stocks (Backed Finance tokens)
const supportedTokens = [
  "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB", // xxTSLA
  "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp", // xxAAPL
  "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN", // xxGOOGL
  "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg", // xxAMZN
  "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX", // xxMSFT
  "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh", // xxNVDA
];

const PORT = process.env.PORT || 3000;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const solanaClient = new SolanaClient({
  rpcUrl: SOLANA_RPC_URL,
  commitment: "confirmed",
});

const ledgerService = new LedgerService(prisma);

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

const reconciliationQueue = new Queue("reconciliation", { connection: redis });
reconciliationQueue.add("run", {}, { repeat: { every: 5 * 60 * 1000 } }).catch((err) => console.error("Failed to add repeatable job:", err));

const reconciliationWorker = new Worker(
  "reconciliation",
  async (job) => {
    await processReconciliationJob(job, prisma, solanaClient);
  },
  { connection: redis }
);

const tradesQueue = new Queue("trades", { connection: redis });

const vaultSigner = (() => {
  const secret = process.env.VAULT_SIGNER_KEY;
  if (!secret) return null;
  try {
    const keypair = Keypair.fromSecretKey(
      Buffer.from(secret, "base64")
    );
    return new MockHSMSigner(keypair);
  } catch {
    return null;
  }
})();

const tradesWorker = new Worker(
  "trades",
  async (job) => {
    await processTradeExecutionJob(job, prisma, solanaClient, vaultSigner);
  },
  { connection: redis }
);

const withdrawalsQueue = new Queue("withdrawals", { connection: redis });
const withdrawalsWorker = new Worker(
  "withdrawals",
  async (job) => {
    const { withdrawalId } = job.data as { withdrawalId: string };
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });
    if (!withdrawal || !withdrawal.withdrawalId) {
      console.warn(`Withdrawal ${withdrawalId} not found or missing withdrawalId`);
      return;
    }
    try {
      const destinationAccount = getAssociatedTokenAddressSync(
        new PublicKey(withdrawal.tokenMint),
        new PublicKey(withdrawal.destinationAddress)
      );
      const tx = await buildWithdrawalToUserTransaction(solanaClient, {
        destinationAccount,
        tokenMint: new PublicKey(withdrawal.tokenMint),
        amount: BigInt(withdrawal.amount.toString()),
        withdrawalId: Buffer.from(withdrawal.withdrawalId, "hex"),
      });
      const serialized = tx.serialize({ requireAllSignatures: false });
      console.log(
        `Withdrawal ${withdrawalId}: built withdrawalToUser tx (${serialized.length} bytes), status -> PROCESSING`
      );
    } catch (err) {
      console.error(`Withdrawal ${withdrawalId}: failed to build tx`, err);
    }
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "PROCESSING" },
    });
  },
  { connection: redis }
);

// Create Express app first
const { app, createWebSocketService } = createServer(prisma, solanaClient, {
  ledgerService,
  tradesQueue,
  withdrawalsQueue,
  supportedTokens,
});

// Create HTTP server with Express app
const httpServer = createHttpServer(app);

// Initialize WebSocket on HTTP server
const wsService = createWebSocketService(httpServer);

const indexer = new IndexerService(solanaClient, prisma, ledgerService);

async function start() {
  try {
    await indexer.start();

    httpServer.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
      console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
    });

    process.on("SIGTERM", async () => {
      console.log("Shutting down...");
      wsService.cleanup();
      await indexer.stop();
      await reconciliationWorker.close();
      await tradesWorker.close();
      await withdrawalsWorker.close();
      await redis.quit();
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import path from "path";

// Load packages/db/.env so DATABASE_URL is set when running from monorepo root (e.g. pnpm dev)
loadEnv({ path: path.resolve(process.cwd(), "packages/db/.env") });

import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { createServer } from "@repo/api";
import { prisma } from "@repo/db";
import { LedgerService } from "@repo/ledger";
import {
    PublicKey,
    SolanaClient,
    buildWithdrawalToUserTransaction,
} from "@repo/solana";
import { IndexerService } from "@repo/indexer";
import { Queue, Worker } from "bullmq";
import { processReconciliationJob } from "@repo/queue";
import Redis from "ioredis";

const PORT = process.env.PORT ?? 3000;
const SOLANA_RPC_URL =
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const solanaClient = new SolanaClient({
    rpcUrl: SOLANA_RPC_URL,
    commitment: "confirmed",
});

const ledgerService = new LedgerService(prisma);

const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

const reconciliationQueue = new Queue("reconciliation", {
    connection: redis,
});

reconciliationQueue
    .add(
        "run",
        {},
        {
            repeat: {
                every: 1000 * 60 * 60 * 24, // 1 day
            },
        },
    )
    .catch((error) => {
        console.error("Failed to add repeatable job:", error);
    });

const reconciliationWorker = new Worker(
    "reconciliation",
    async (job) => {
        await processReconciliationJob(job, prisma, solanaClient);
        console.log("Running reconciliation job");
    },
    {
        connection: redis,
    },
);

const tradesQueue = new Queue("trades", { connection: redis });
const tradesWorker = new Worker(
    "trades",
    async (job) => {
        const { tradeId } = job.data as { tradeId: string };
        await prisma.trade.update({
            where: { id: tradeId },
            data: { status: "SUBMITTED" }
        });
        console.log(`Trade ${tradeId} queued for execution (status -> SUBMITTED)`);
    },
    { connection: redis },
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
            console.warn(
                `Withdrawal ${withdrawalId} not found or missing withdrawalId`,
            );
            return;
        }
        try {
            const destinationAccount = getAssociatedTokenAddressSync(
                new PublicKey(withdrawal.tokenMint),
                new PublicKey(withdrawal.destinationAddress),
            );
            const tx = await buildWithdrawalToUserTransaction(solanaClient, {
                destinationAccount: destinationAccount,
                tokenMint: new PublicKey(withdrawal.tokenMint),
                amount: withdrawal.amount,
                withdrawalId: Buffer.from(withdrawal.withdrawalId, "hex"),
            });
            const serialized = tx.serialize({
                requireAllSignatures: false,
            });
            console.log(
                `Withdrawal ${withdrawalId}: built withdrawalToUser tx (${serialized.length} bytes), status -> PROCESSING`,
            );
        } catch (error) {
            console.error(
                `Withdrawal ${withdrawalId}: error building withdrawalToUser tx:`,
                error,
            );
        }

        await prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: {
                status: "PROCESSING",
            },
        });
    },
    { connection: redis },
);

const app = createServer(prisma, solanaClient, {
    ledgerService,
    tradesQueue,
    withdrawalsQueue,
});

const indexer = new IndexerService(solanaClient, prisma, ledgerService);

async function start() {
    try {
        await indexer.start();

        app.listen(PORT, () => {
            console.log(`API server is running on port ${PORT}`);
        });

        process.on("SIGTERM", async () => {
            console.log("SIGTERM received, shutting down...");
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

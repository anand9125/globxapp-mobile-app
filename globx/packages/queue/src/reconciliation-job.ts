// Reconciliation job for BullMQ

import { Job } from "bullmq";
import type { PrismaClient } from "@repo/db";
import type { SolanaClient } from "@repo/solana";
import { ReconciliationEngine } from "@repo/reconciliation";
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export async function processReconciliationJob(
  job: Job,
  prisma: PrismaClient,
  solanaClient: SolanaClient
): Promise<void> {
  logger.info({ jobId: job.id }, "Processing reconciliation job");

  const engine = new ReconciliationEngine(prisma, solanaClient);

  try {
    const result = await engine.runReconciliation();

    logger.info(
      {
        jobId: job.id,
        tokensChecked: result.tokensChecked,
        mismatches: result.mismatches.length,
        systemFrozen: result.systemFrozen,
      },
      "Reconciliation job completed"
    );

    if (result.mismatches.length > 0) {
      logger.warn(
        { mismatches: result.mismatches },
        "Reconciliation mismatches detected"
      );
    }
  } catch (error) {
    logger.error(
      {
        jobId: job.id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Reconciliation job failed"
    );
    throw error;
  }
}

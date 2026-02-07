import { PrismaClient } from "@repo/db";
import { SolanaClient } from "@repo/solana";
import { logger } from "./logger";
import { LedgerService } from "@repo/ledger";

export interface ReorgDetectionResult {
  hasReorg: boolean;
  affectedSlots: number[];
  affectedEvents: Array<{
    id: bigint;
    txSignature: string;
    slot: bigint;
  }>;
}

//Detect if a reorg has occurred by checking if finalized events
//are still in the canonical chain

export async function detectReorg(
  prisma: PrismaClient,
  client: SolanaClient,
  // the slot of the event that we are indexing
  currentSlot: number,
): Promise<ReorgDetectionResult> {
  // Get all finalized events from recent slots
  const recentEvents = await prisma.onChainEvent.findMany({
    where: {
      status: "FINALIZED", // todo: why are we checking status finzalised
      // greater then or equal to the current slot minus 100
      slot: {
        gte: BigInt(currentSlot - 100),
      },
    },
    orderBy: {
      slot: "desc",
    },
    take: 100,
  });

  const affectedEvents: Array<{
    id: bigint;
    txSignature: string;
    slot: bigint;
  }> = [];

  for (const event of recentEvents) {
    try {
      const status = await client.getSignatureStatus(event.txSignature);

      // If transaction is null or has different slot, it was reorged
      if (
        !status.value ||
        (status.value.slot && BigInt(status.value.slot)) !== event.slot
      ) {
        affectedEvents.push({
          id: event.id,
          txSignature: event.txSignature,
          slot: event.slot,
        });
      }
    } catch (error) {
      logger.warn(
        { eventId: event.id, signature: event.txSignature },
        "Could not verify transaction status",
      );
      affectedEvents.push({
        id: event.id,
        txSignature: event.txSignature,
        slot: event.slot,
      });
    }
  }
  const affectedSlots = [
    ...new Set(affectedEvents.map((e) => Number(e.slot))),
  ].sort((a, b) => a - b);

  return {
    hasReorg: affectedEvents.length > 0,
    affectedSlots,
    affectedEvents,
  };
}

//Rollback reorged events
//Marks events as REORGED and triggers compensation logic (reversing ledger entries, update statuses)

export async function rollbackReorgedEvents(
  prisma: PrismaClient,
  ledgerService: LedgerService,
  reorgResult: ReorgDetectionResult,
): Promise<void> {
  if (!reorgResult.hasReorg) {
    return;
  }

  logger.warn(
    {
      affectedEvents: reorgResult.affectedEvents.length,
      affectedSlots: reorgResult.affectedSlots,
    },
    "Rolling back reorged events",
  );

  await prisma.onChainEvent.updateMany({
    where: {
      id: {
        in: reorgResult.affectedEvents.map((e) => e.id),
      },
    },
    data: {
      status: "REORGED",
    },
  });

  // Compensation: for each affected event, find linked entities, reverse ledger entries, update statuses
  const reverseTxIdPrefix = `reorg-reverse-${Date.now()}`;
  for (const ev of reorgResult.affectedEvents) {
    const TransactionId = `${reverseTxIdPrefix}-${ev.id}`;
    try {
      const [deposits, trades, withdrawals] = await Promise.all([
        prisma.deposit.findMany({ where: { onChainEventId: ev.id } }),
        prisma.trade.findMany({ where: { onChainEventId: ev.id } }),
        prisma.withdrawal.findMany({ where: { onChainEventId: ev.id } }),
      ]);

      for (const deposit of deposits) {
        await ledgerService.reverseDeposit(
          deposit.userId,
          deposit.tokenMint,
          deposit.amount.toString(),
          `${TransactionId}-deposit-${deposit.id}`,
          { depositId: deposit.id, onChainEventId: String(ev.id) },
        );
        await prisma.deposit.update({
          where: { id: deposit.id },
          data: { status: "FAILED" },
        });
        logger.info(
          { depositId: deposit.id },
          "Reorg: deposit reversed and marked FAILED",
        );
      }

      for (const trade of trades) {
        await ledgerService.reverseTrade(
          trade.userId,
          trade.direction as "BUY" | "SELL",
          trade.inputTokenMint,
          trade.inputAmount.toString(),
          trade.outputTokenMint,
          trade.outputAmount.toString(),
          trade.feeAmount.toString(),
          trade.feeTokenMint,
          `${TransactionId}-trade-${trade.id}`,
          { tradeId: trade.id, onChainEventId: String(ev.id) },
        );
        await prisma.trade.update({
          where: { id: trade.id },
          data: { status: "FAILED" },
        });
        logger.info(
          { tradeId: trade.id },
          "Reorg: trade reversed and marked FAILED",
        );
      }

      for (const withdrawal of withdrawals) {
        await ledgerService.reverseWithdrawal(
          withdrawal.userId,
          withdrawal.tokenMint,
          withdrawal.amount.toString(),
          `${TransactionId}-withdrawal-${withdrawal.id}`,
          { withdrawalId: withdrawal.id, onChainEventId: String(ev.id) },
        );
        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: { status: "FAILED" },
        });
        logger.info(
          { withdrawalId: withdrawal.id },
          "Reorg: withdrawal reversed and marked FAILED",
        );
      }
    } catch (error) {
      logger.error(
        {
          eventId: ev.id,
          error: error instanceof Error ? error.message : String(error),
        },
        "Reorg compensation failed for event",
      );
    }
  }

  logger.warn(
    { affectedEvents: reorgResult.affectedEvents.length },
    "Reorg compensation completed",
  );
}

// Check for reorgs periodically
export async function checkForReorgs(
  prisma: PrismaClient,
  client: SolanaClient,
  ledgerService: LedgerService,
): Promise<ReorgDetectionResult> {
  const currentSlot = await client.getLatestSlot();
  const reorgResult = await detectReorg(prisma, client, currentSlot);

  if (reorgResult.hasReorg) {
    await rollbackReorgedEvents(prisma, ledgerService, reorgResult);
  }

  return reorgResult;
}

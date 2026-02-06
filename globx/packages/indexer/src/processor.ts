//Event processor for on-chain events
//Processes Anchor events and writes to database

import { PrismaClient } from "@repo/db";
import { OnChainEventType } from "@repo/shared";
import { SolanaClient } from "@repo/solana";
import { checkFinality, waitForFinality } from "./finality";
import { logger } from "./logger";
import { BN } from "@coral-xyz/anchor";

export interface ProcessedEvent {
  eventType: OnChainEventType;
  txSignature: string;
  slot: bigint;
  blockTime: bigint | null;
  eventData: Record<string, unknown>;
  status: "TENTATIVE" | "FINALIZED" | "REORGED";
  confirmations: number;
}

//Process a raw Anchor event

export async function processEvent(
  prisma: PrismaClient,
  client: SolanaClient,
  event: {
    name: string;
    data: Record<string, unknown>;
    txSignature: string;
    slot: number;
    blockTime: number | null;
  },
): Promise<bigint> {
  const eventType = event.name as OnChainEventType;

  logger.info(
    {
      eventType,
      txSignature: event.txSignature,
      slot: event.slot,
    },
    "Processing on-chain event",
  );

  // Check initial finality status
  const finalityCheck = await checkFinality(client, event.txSignature);

  // Create event record (initially TENTATIVE)
  const created = await prisma.onChainEvent.create({
    data: {
      eventType,
      eventDiscriminator: "", // Would be set from Anchor event discriminator
      txSignature: event.txSignature,
      slot: BigInt(event.slot),
      blockTime: event.blockTime ? BigInt(event.blockTime) : null,
      programId: "", // Would be set from program ID
      status: finalityCheck.finalized ? "FINALIZED" : "TENTATIVE",
      confirmations: finalityCheck.confirmations,
      finalizedAt: finalityCheck.finalized ? new Date() : null,
      eventData: event.data as any,
    },
  });
  // If not finalized, wait for finality (async, non-blocking)
  if (!finalityCheck.finalized) {
    waitForFinality(client, event.txSignature)
      .then(async (result) => {
        if (result.finalized) {
          await prisma.onChainEvent.update({
            where: { id: created.id },
            data: {
              status: "FINALIZED",
              confirmations: result.confirmations,
              finalizedAt: new Date(),
            },
          });

          logger.info(
            {
              eventId: created.id,
              txSignature: event.txSignature,
            },
            "Event finalized",
          );
        }
      })
      .catch((error) => {
        logger.error(
          {
            eventId: created.id,
            error: error.message,
          },
          "Error waiting for finality",
        );
      });
  }

  return created.id;
}

//Process depositReceived event

export async function processDepositReceivedEvent(
  prisma: PrismaClient,
  eventData: {
    depositId: number[];
    tokenMint: string;
    amount: BN;
    source: string;
    timestamp: BN;
  },
  onChainEventId: bigint,
): Promise<void> {
  const depositId = Buffer.from(eventData.depositId).toString("hex");

  // Find matching deposit by depositId
  const deposit = await prisma.deposit.findUnique({
    where: { depositId },
  });

  if (deposit) {
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        status: "CONFIRMED",
        depositVaultReceived: true,
        confirmedAt: new Date(),
        onChainEventId,
      },
    });

    logger.info(
      { depositId: deposit.id },
      "Deposit confirmed from on-chain event",
    );
  } else {
    logger.warn({ depositId }, "Deposit not found for on-chain event");
  }
}

//Process swapExecuted event

export async function processSwapExecutedEvent(
  prisma: PrismaClient,
  eventData: {
    userId: number[];
    inputMint: string;
    outputMint: string;
    inputAmount: BN;
    outputAmount: BN;
    feeAmount: BN;
    timestamp: BN;
    slot: BN;
  },
  onChainEventId: bigint,
): Promise<void> {
  const userIdHash = Buffer.from(eventData.userId).toString("hex");

  // Find matching trade by userId hash and recent timestamp
  // In production, you'd have a better way to match trades
  const trade = await prisma.trade.findFirst({
    where: {
      status: "SUBMITTED",
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // Within last 5 minutes
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (trade) {
    await prisma.trade.update({
      where: { id: trade.id },
      data: {
        status: "EXECUTED",
        executedAt: new Date(),
        outputAmount: eventData.outputAmount.toString(),
        onChainEventId,
      },
    });

    logger.info({ tradeId: trade.id }, "Trade executed from on-chain event");
  } else {
    logger.warn({ userIdHash }, "Trade not found for on-chain event");
  }
}

// Process swapFailed event
export async function processSwapFailedEvent(
  prisma: PrismaClient,
  eventData: {
    userId: number[];
    inputMint: string;
    outputMint: string;
    inputAmount: BN;
    errorCode: number;
    timestamp: BN;
  },
  _onChainEventId: bigint,
): Promise<void> {
  const userIdHash = Buffer.from(eventData.userId).toString("hex");

  // Find matching trade
  const trade = await prisma.trade.findFirst({
    where: {
      status: "SUBMITTED",
      inputTokenMint: eventData.inputMint,
      outputTokenMint: eventData.outputMint,
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (trade) {
    await prisma.trade.update({
      where: { id: trade.id },
      data: {
        status: "FAILED",
        onChainEventId: _onChainEventId,
        metadata: {
          ...((trade.metadata as Record<string, unknown>) || {}),
          errorCode: eventData.errorCode,
          failedAt: new Date().toISOString(),
        },
      },
    });

    logger.warn(
      { tradeId: trade.id, errorCode: eventData.errorCode },
      "Trade failed from on-chain event",
    );
  }
}

//Process vaultToUserWithdrawal event

export async function processVaultToUserWithdrawalEvent(
  prisma: PrismaClient,
  eventData: {
    withdrawalId: number[];
    tokenMint: string;
    amount: BN;
    destination: string;
    timestamp: BN;
  },
  onChainEventId: bigint,
): Promise<void> {
  const withdrawalId = Buffer.from(eventData.withdrawalId).toString("hex");

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { withdrawalId },
  });

  if (withdrawal) {
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: "COMPLETED",
        withdrawalVaultSent: true,
        completedAt: new Date(),
        onChainEventId,
      },
    });

    logger.info(
      { withdrawalId: withdrawal.id },
      "Withdrawal completed from on-chain event",
    );
  } else {
    logger.warn({ withdrawalId }, "Withdrawal not found for on-chain event");
  }
}

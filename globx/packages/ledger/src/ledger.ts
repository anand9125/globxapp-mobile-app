import { PrismaClient } from "@repo/db";
import {
  add,
  Decimal,
  DoubleEntryMismatchError,
  DoubleEntryTransaction,
  InsufficientBalanceError,
  isZero,
  LedgerAccountType,
  LedgerEntryInput,
  LedgerEntryType,
  subtract,
} from "@repo/shared";
import { getLatestEntryHash, hashEntry } from "./hash_chain";

export class LedgerService {
  constructor(private prisma: PrismaClient) {}

  async createTransaction(
    transaction: DoubleEntryTransaction,
  ): Promise<Array<{ id: bigint; entryHash: string }>> {
    let totalDebits = new Decimal(0);
    let totalCredits = new Decimal(0);

    const debitsByToken = new Map<string, Decimal>();
    const creditsByToken = new Map<string, Decimal>();

    for (const entry of transaction.entries) {
      let amount = new Decimal(entry.amount.toString());
      const tokenMint = entry.tokenMint || "SYSTEM";

      if (entry.side == "DEBIT") {
        totalDebits = add(totalDebits, amount);
        debitsByToken.set(
          tokenMint,
          add(debitsByToken.get(tokenMint) || 0, amount),
        );
      } else if (entry.side == "CREDIT") {
        totalCredits = add(totalCredits, amount);
        creditsByToken.set(
          tokenMint,
          add(creditsByToken.get(tokenMint) || 0, amount),
        );
      } else {
        throw new Error(`Invalid side: ${entry.side}`);
      }
    }

    //Check OverAll Balance
    if (!totalDebits.equals(totalCredits)) {
      throw new DoubleEntryMismatchError(
        totalDebits.toString(),
        totalCredits.toString(),
      );
    }

    //Check: per-token balance (for multi-token transactions)
    for (const [tokenMint, debits] of debitsByToken.entries()) {
      const credits = creditsByToken.get(tokenMint) || new Decimal(0);
      if (!debits.equals(credits)) {
        throw new DoubleEntryMismatchError(
          debits.toString(),
          credits.toString(),
        );
      }
    }

    // Get previous hash for chain continuity
    const previousHash = await getLatestEntryHash(this.prisma);

    //Create all entries in transactions
    const createdEntries = await this.prisma.$transaction(async (tx) => {
      const entries: Array<{ id: bigint; entryHash: string }> = [];

      for (const entryInput of transaction.entries) {
        // Get the ID for the new entry (will be auto-incremented)
        const lastEntry = await tx.ledgerEntry.findFirst({
          orderBy: { id: "desc" },
          select: { id: true },
        });

        const nextId = lastEntry ? lastEntry.id + BigInt(1) : BigInt(1);

        //Build Entry data
        const entryData: LedgerEntryInput = {
          entryType:
            (transaction.metadata?.entryType as LedgerEntryType) ||
            "ADJUSTMENT",
          transactionId: transaction.transactionId,
          userId: entryInput.userId,
          accountType: entryInput.accountType,
          tokenMint: entryInput.tokenMint,
          amount: entryInput.amount,
          side: entryInput.side,
          description: entryInput.description,
          metadata: entryInput.metadata ?? transaction.metadata ?? undefined,
          createdBy: transaction.createdBy || "system",
        };

        //Compute Hash(using previous hash from last created entry, or chain head)
        const lastCreated =
          entries.length > 0 ? entries[entries.length - 1] : null;
        const currentPreviousHash = lastCreated
          ? lastCreated.entryHash
          : previousHash;
        const entryHash = hashEntry(
          {
            id: nextId,
            ...entryData,
            createdAt: new Date(),
          },
          currentPreviousHash,
        );

        // Create ledger entry
        const created = await tx.ledgerEntry.create({
          data: {
            entryType: entryData.entryType,
            transactionId: entryData.transactionId,
            userId: entryData.userId,
            accountType: entryData.accountType,
            tokenMint: entryData.tokenMint,
            amount: entryData.amount.toString(),
            side: entryData.side,
            description: entryData.description,
            metadata: entryData.metadata as never,
            previousHash: currentPreviousHash,
            entryHash,
            createdAt: new Date(),
            createdBy: entryData.createdBy,
          },
        });

        entries.push({ id: created.id, entryHash: created.entryHash });
        await tx.ledgerHashChain.create({
          data: {
            entryId: created.id,
            previousHash: currentPreviousHash,
            entryHash,
            chainPosition: Number(created.id),
          },
        });
      }
      return entries;
    });
    return createdEntries;
  }

  //Create deposit ledger entries
  //DR: ASSET_CASH (user's cash account)
  //CR: EQUITY_USER (user's equity)

  async recordDeposit(
    userId: string,
    tokenMint: string,
    amount: bigint | string,
    transactionId: string,
    metadata?: Record<string, unknown>,
  ): Promise<Array<{ id: bigint; entryHash: string }>> {
    return this.createTransaction({
      transactionId,
      entries: [
        {
          userId,
          accountType: "ASSET_CASH",
          tokenMint,
          amount,
          side: "DEBIT",
          description: `Deposit ${amount} ${tokenMint}`,
          metadata,
        },
        {
          userId,
          accountType: "EQUITY_USER",
          tokenMint,
          amount,
          side: "CREDIT",
          description: `Deposit ${amount} ${tokenMint}`,
          metadata,
        },
      ],
      metadata: { entryType: "DEPOSIT", ...metadata },
      createdBy: "deposit_service",
    });
  }

  //Create trade ledger entries
  //BUY: DR ASSET_STOCK, CR ASSET_CASH
  //SELL: DR ASSET_CASH, CR ASSET_STOCK

  async recordTrade(
    userId: string,
    direction: "BUY" | "SELL",
    inputTokenMint: string,
    inputAmount: bigint | string,
    outputTokenMint: string,
    outputAmount: bigint | string,
    feeAmount: bigint | string,
    feeTokenMint: string,
    transactionId: string,
    metadata?: Record<string, unknown>,
  ): Promise<Array<{ id: bigint; entryHash: string }>> {
    const entries: Array<{
      userId?: string;
      accountType: string;
      tokenMint: string;
      amount: bigint | string;
      side: "DEBIT" | "CREDIT";
      description: string;
    }> = [];

    if (direction == "BUY") {
      // DR: ASSET_STOCK (user receives stock)
      entries.push({
        userId,
        accountType: "ASSET_STOCK",
        tokenMint: outputTokenMint,
        amount: outputAmount,
        side: "DEBIT",
        description: `Buy ${outputAmount} ${outputTokenMint}`,
      });
      // CR: ASSET_CASH (user pays cash)
      entries.push({
        userId,
        accountType: "ASSET_CASH",
        tokenMint: inputTokenMint,
        amount: inputAmount,
        side: "CREDIT",
        description: `Buy ${outputAmount} ${outputTokenMint} for ${inputAmount} ${inputTokenMint}`,
      });
    } else {
      // SELL: DR ASSET_CASH (user receives cash)
      entries.push({
        userId,
        accountType: "ASSET_CASH",
        tokenMint: outputTokenMint,
        amount: outputAmount,
        side: "DEBIT",
        description: `Sell ${inputAmount} ${inputTokenMint} for ${outputAmount} ${outputTokenMint}`,
      });

      // CR: ASSET_STOCK (user gives stock)
      entries.push({
        userId,
        accountType: "ASSET_STOCK",
        tokenMint: inputTokenMint,
        amount: inputAmount,
        side: "CREDIT",
        description: `Sell ${inputAmount} ${inputTokenMint}`,
      });
    }
    // Fee entry: DR REVENUE_FEES (system receives fee)
    if (!isZero(feeAmount)) {
      entries.push({
        userId: undefined,
        accountType: "REVENUE_FEES" as LedgerAccountType,
        tokenMint: feeTokenMint,
        amount: feeAmount,
        side: "DEBIT",
        description: `Trade fee ${feeAmount} ${feeTokenMint}`,
      });

      // CR: ASSET_CASH (user pays fee from cash)
      entries.push({
        userId,
        accountType: "ASSET_CASH",
        tokenMint: feeTokenMint,
        amount: feeAmount,
        side: "CREDIT",
        description: `Trade fee ${feeAmount} ${feeTokenMint}`,
      });
    }
    return this.createTransaction({
      transactionId,
      entries: entries as DoubleEntryTransaction["entries"],
      metadata: { entryType: "TRADE", direction, ...metadata },
      createdBy: "trade-service",
    });
  }

  //Create withdrawal ledger entries
  //DR: EQUITY_USER (user's equity decreases)
  //CR: ASSET_CASH (user's cash decreases)

  async recordWithdrawl(
    userId: string,
    tokenMint: string,
    amount: bigint | string,
    transactionId: string,
    metadata?: Record<string, unknown>,
  ): Promise<Array<{ id: bigint; entryHash: string }>> {
    return this.createTransaction({
      transactionId,
      entries: [
        {
          userId,
          accountType: "EQUITY_USER",
          tokenMint,
          amount,
          side: "DEBIT",
          description: `Withdrawal ${amount} ${tokenMint}`,
          metadata,
        },
        {
          userId,
          accountType: "ASSET_CASH",
          tokenMint,
          amount,
          side: "CREDIT",
          description: `Withdrawal ${amount} ${tokenMint}`,
          metadata,
        },
      ],
      metadata: { entryType: "WITHDRAWAL", ...metadata },
      createdBy: "withdrawal-service",
    });
  }
  //Reverse a deposit (e.g. after reorg)
  //CR: ASSET_CASH, DR: EQUITY_USER — cancels the original deposit entries
  async reverseDeposit(
    userId: string,
    tokenMint: string,
    amount: bigint | string,
    transactionId: string,
    metadata?: Record<string, unknown>,
  ): Promise<Array<{ id: bigint; entryHash: string }>> {
    return this.createTransaction({
      transactionId,
      entries: [
        {
          userId,
          accountType: "ASSET_CASH",
          tokenMint,
          amount,
          side: "CREDIT",
          description: `Reversal: Deposit ${amount} ${tokenMint}`,
          metadata,
        },
        {
          userId,
          accountType: "EQUITY_USER",
          tokenMint,
          amount,
          side: "DEBIT",
          description: `Reversal: Deposit ${amount} ${tokenMint}`,
          metadata,
        },
      ],
      metadata: { entryType: "ADJUSTMENT" as LedgerEntryType, ...metadata },
      createdBy: "reorg-compensation",
    });
  }

  //Reverse a trade (e.g. after reorg)
  //Opposite sides for stock/cash and fee entries
  async reverseTrade(
    userId: string,
    direction: "BUY" | "SELL",
    inputTokenMint: string,
    inputAmount: bigint | string,
    outputTokenMint: string,
    outputAmount: bigint | string,
    feeAmount: bigint | string,
    feeTokenMint: string,
    transactionId: string,
    metadata?: Record<string, unknown>,
  ): Promise<Array<{ id: bigint; entryHash: string }>> {
    const entries: Array<{
      userId: string | undefined;
      accountType: string;
      tokenMint: string;
      amount: bigint | string;
      side: "DEBIT" | "CREDIT";
      description: string;
    }> = [];

    if (direction === "BUY") {
      // Reverse: CR ASSET_STOCK, DR ASSET_CASH
      entries.push({
        userId,
        accountType: "ASSET_STOCK",
        tokenMint: outputTokenMint,
        amount: outputAmount,
        side: "CREDIT",
        description: `Reversal: Buy ${outputAmount} ${outputTokenMint}`,
      });
      entries.push({
        userId,
        accountType: "ASSET_CASH",
        tokenMint: inputTokenMint,
        amount: inputAmount,
        side: "DEBIT",
        description: `Reversal: Buy ${outputAmount} ${outputTokenMint} for ${inputAmount} ${inputTokenMint}`,
      });
    } else {
      entries.push({
        userId,
        accountType: "ASSET_CASH",
        tokenMint: outputTokenMint,
        amount: outputAmount,
        side: "CREDIT",
        description: `Reversal: Sell ${inputAmount} ${inputTokenMint} for ${outputAmount} ${outputTokenMint}`,
      });
      entries.push({
        userId,
        accountType: "ASSET_STOCK",
        tokenMint: inputTokenMint,
        amount: inputAmount,
        side: "DEBIT",
        description: `Reversal: Sell ${inputAmount} ${inputTokenMint}`,
      });
    }

    if (!isZero(feeAmount)) {
      entries.push({
        userId: undefined,
        accountType: "REVENUE_FEES" as LedgerAccountType,
        tokenMint: feeTokenMint,
        amount: feeAmount,
        side: "CREDIT",
        description: `Reversal: Trade fee ${feeAmount} ${feeTokenMint}`,
      });
      entries.push({
        userId,
        accountType: "ASSET_CASH" as LedgerAccountType,
        tokenMint: feeTokenMint,
        amount: feeAmount,
        side: "DEBIT",
        description: `Reversal: Trade fee ${feeAmount} ${feeTokenMint}`,
      });
    }

    return this.createTransaction({
      transactionId,
      entries: entries as DoubleEntryTransaction["entries"],
      metadata: {
        entryType: "ADJUSTMENT" as LedgerEntryType,
        direction,
        ...metadata,
      },
      createdBy: "reorg-compensation",
    });
  }

  //Reverse a withdrawal (e.g. after reorg)
  //CR: EQUITY_USER, DR: ASSET_CASH — cancels the original withdrawal entries
  async reverseWithdrawal(
    userId: string,
    tokenMint: string,
    amount: bigint | string,
    transactionId: string,
    metadata?: Record<string, unknown>,
  ): Promise<Array<{ id: bigint; entryHash: string }>> {
    return this.createTransaction({
      transactionId,
      entries: [
        {
          userId,
          accountType: "EQUITY_USER",
          tokenMint,
          amount,
          side: "CREDIT",
          description: `Reversal: Withdrawal ${amount} ${tokenMint}`,
          metadata,
        },
        {
          userId,
          accountType: "ASSET_CASH",
          tokenMint,
          amount,
          side: "DEBIT",
          description: `Reversal: Withdrawal ${amount} ${tokenMint}`,
          metadata,
        },
      ],
      metadata: { entryType: "ADJUSTMENT" as LedgerEntryType, ...metadata },
      createdBy: "reorg-compensation",
    });
  }

  //Get user balance for a specific token
  async getUserBalance(userId: string, tokenMint: string): Promise<Decimal> {
    const result = await this.prisma.ledgerEntry.groupBy({
      by: ["side"],
      where: {
        userId,
        tokenMint,
      },
      _sum: {
        amount: true,
      },
    });

    let balance = new Decimal(0);

    for (const row of result) {
      const amount = new Decimal(row._sum.amount?.toString() || "0");
      if (row.side === "DEBIT") {
        balance = add(balance, amount);
      } else if (row.side === "CREDIT") {
        balance = subtract(balance, amount);
      }
    }

    return balance;
  }

  //Verify user has sufficient balance

  async verifyBalance(
    userId: string,
    tokenMint: string,
    requiredAmount: bigint | string,
  ): Promise<void> {
    const balance = await this.getUserBalance(userId, tokenMint);
    const required = new Decimal(requiredAmount.toString());

    if (balance.lessThan(required)) {
      throw new InsufficientBalanceError(
        tokenMint,
        balance.toString(),
        required.toString(),
      );
    }
  }
}

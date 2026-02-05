import { PrismaClient } from "@repo/db";
import { HashChainEntry, verifyHashChain } from "./hash_chain";
import { error } from "console";
import { Decimal } from "@repo/shared";

export class LedgerVerificationService {
  constructor(private prisma: PrismaClient) {}

  //Verify hash chain integrity for all entries
  async verifyHashChainIntegrity(): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      const entries = await this.prisma.ledgerEntry.findMany({
        orderBy: { id: "asc" },
        select: {
          id: true,
          entryType: true,
          transactionId: true,
          userId: true,
          accountType: true,
          tokenMint: true,
          amount: true,
          side: true,
          description: true,
          metadata: true,
          createdAt: true,
          createdBy: true,
          previousHash: true,
          entryHash: true,
        },
      });

      if (entries.length === 0) {
        return { valid: true };
      }

      verifyHashChain(
        entries as (HashChainEntry & {
          entryHash: string;
          previousHash: string | null;
        })[],
      );
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async verifyDoubleEntry(): Promise<{
    valid: boolean;
    mismatches?: Array<{
      transactionId: string;
      debits: string;
      credits: string;
      difference: string;
    }>;
  }> {
    const transaction = await this.prisma.ledgerEntry.groupBy({
      by: ["transactionId"],
    });

    const mismatches: Array<{
      transactionId: string;
      debits: string;
      credits: string;
      difference: string;
    }> = [];

    for (const tx of transaction) {
      const entries = await this.prisma.ledgerEntry.findMany({
        where: { transactionId: tx.transactionId },
      });

      let totalDebits = new Decimal(0);
      let totalCredits = new Decimal(0);

      for (const entry of entries) {
        const amount = new Decimal(entry.amount.toString());
        if (entry.side === "DEBIT") {
          totalDebits = totalDebits.plus(amount);
        } else {
          totalCredits = totalCredits.plus(amount);
        }
      }

      if (!totalDebits.equals(totalCredits)) {
        mismatches.push({
          transactionId: tx.transactionId,
          debits: totalDebits.toString(),
          credits: totalCredits.toString(),
          difference: totalDebits.minus(totalCredits).abs().toString(),
        });
      }
    }

    return {
      valid: mismatches.length === 0,
      mismatches: mismatches.length > 0 ? mismatches : undefined,
    };
  }

  //Verify balances match ledger entries
  async verifyBalances(): Promise<{
    valid: boolean;
    mismatches?: Array<{
      userId: string;
      tokenMint: string;
      balanceTable: string;
      ledgerCalculated: string;
      difference: string;
    }>;
  }> {
    const balances = await this.prisma.balance.findMany({
      select: {
        userId: true,
        tokenMint: true,
        amount: true,
      },
    });
    const mismatches: Array<{
      userId: string;
      tokenMint: string;
      balanceTable: string;
      ledgerCalculated: string;
      difference: string;
    }> = [];

    for (const balance of balances) {
      // Calculate balance from ledger
      const entries = await this.prisma.ledgerEntry.findMany({
        where: {
          userId: balance.userId,
          tokenMint: balance.tokenMint,
        },
      });

      let ledgerBalance = new Decimal(0);
      for (const entry of entries) {
        const amount = new Decimal(entry.amount.toString());
        if (entry.side === "DEBIT") {
          ledgerBalance = ledgerBalance.plus(amount);
        } else {
          ledgerBalance = ledgerBalance.minus(amount);
        }
      }

      const balanceTableAmount = new Decimal(balance.amount.toString());
      if (!ledgerBalance.equals(balanceTableAmount)) {
        mismatches.push({
          userId: balance.userId,
          tokenMint: balance.tokenMint,
          balanceTable: balanceTableAmount.toString(),
          ledgerCalculated: ledgerBalance.toString(),
          difference: ledgerBalance.minus(balanceTableAmount).abs().toString(),
        });
      }
    }

    return {
      valid: mismatches.length === 0,
      mismatches: mismatches.length > 0 ? mismatches : undefined,
    };
  }

  //Run all verification checks

  async runAllChecks(): Promise<{
    hashChain: { valid: boolean; error?: string };
    doubleEntry: { valid: boolean; mismatches?: unknown[] };
    balances: { valid: boolean; mismatches?: unknown[] };
  }> {
    const [hashChain, doubleEntry, balances] = await Promise.all([
      this.verifyHashChainIntegrity(),
      this.verifyDoubleEntry(),
      this.verifyBalances(),
    ]);

    return {
      hashChain,
      doubleEntry,
      balances,
    };
  }
}

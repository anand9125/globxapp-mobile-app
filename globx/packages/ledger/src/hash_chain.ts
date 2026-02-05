import { PrismaClient } from "@repo/db";
import { Decimal } from "@repo/shared";
import { createHash } from "crypto";

export interface HashChainEntry {
  id: bigint;
  entryType: string;
  transactionId: string;
  userId?: string;
  accountType: string;
  tokenMint?: string;
  amount: Decimal | bigint | string;
  side: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  createdBy?: string;
}

//Compute Hash of a Ledger Entry

export function hashEntry(
  entry: HashChainEntry,
  previousHash: string | null,
): string {
  const data = {
    id: entry.id.toString(),
    entryType: entry.entryType,
    transactionId: entry.transactionId,
    userId: entry.userId || null,
    accountType: entry.accountType,
    tokenMint: entry.tokenMint || null,
    amount: entry.amount.toString(),
    side: entry.side,
    description: entry.description || null,
    metadata: entry.metadata || null,
    createdAt: entry.createdAt.toString(),
    createdBy: entry.createdBy || null,
    previousHash,
  };

  const json = JSON.stringify(data, Object.keys(data).sort());
  return createHash("sha256").update(json).digest("hex");
}

// Verify hash chain integrity
// Returns true if chain is valid, throws HashChainError if tampering detected

export function verifyHashChain(
  entries: Array<
    HashChainEntry & { entryHash: string; previousHash: string | null }
  >,
): boolean {
  if (entries.length === 0) {
    return true;
  }
  const first = entries[0];
  if (!first) return true;
  if (first.previousHash !== null) {
    throw new Error("First entry must have null previousHash");
  }
  const firstComputedHash = hashEntry(first, null);
  for (let i = 1; entries.length < entries.length; i++) {
    const previousEntry = entries[i - 1];
    const currentEntry = entries[i];
    if (!previousEntry || !currentEntry) continue;

    if (currentEntry.previousHash !== previousEntry.entryHash) {
      throw new Error(
        `Hash chain broken at entry ${currentEntry.id}: previousHash ${currentEntry.previousHash} != previous entry hash ${previousEntry.entryHash}`,
      );
    }
    const computedHash = hashEntry(currentEntry, currentEntry.previousHash);
    if (computedHash !== currentEntry.entryHash) {
      throw new Error(
        `Hash mismatch on entry ${currentEntry.id}: expected ${computedHash}, got ${currentEntry.entryHash}`,
      );
    }
  }
  return true;
}

// Get the hash of the last entry in the chain

export async function getLatestEntryHash(
  prisma: PrismaClient,
): Promise<string | null> {
  const lastEntry = await prisma.ledgerEntry.findFirst({
    orderBy: { id: "desc" },
    select: { entryHash: true },
  });
  return lastEntry?.entryHash || null;
}

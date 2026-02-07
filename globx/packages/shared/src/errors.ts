// Custom error types for the platform
export class LedgerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "LedgerError";
  }
}

export class InsufficientBalanceError extends LedgerError {
  constructor(tokenMint: string, available: string, requested: string) {
    super(
      `Insufficient balance: available ${available}, requested ${requested} for token ${tokenMint}`,
      "INSUFFICIENT_BALANCE",
    );
  }
}

export class DoubleEntryMismatchError extends LedgerError {
  constructor(debits: string, credits: string) {
    super(
      `Double-entry mismatch: debits ${debits} != credits ${credits}`,
      "DOUBLE_ENTRY_MISMATCH",
    );
  }
}

export class HashChainError extends LedgerError {
  constructor(message: string) {
    super(message, "HASH_CHAIN_ERROR");
  }
}

export class IdempotencyError extends Error {
  constructor(
    message: string,
    public readonly existingResponse?: unknown,
  ) {
    super(message);
    this.name = "IdempotencyError";
  }
}

export class ReconciliationError extends Error {
  constructor(
    message: string,
    public readonly mismatches?: Array<{
      tokenMint: string;
      ledgerBalance: string;
      onChainBalance: string;
      difference: string;
    }>,
  ) {
    super(message);
    this.name = "ReconciliationError";
  }
}

export class SystemFrozenError extends Error {
  constructor(reason?: string) {
    super(`System is frozen${reason ? `: ${reason}` : ""}`);
    this.name = "SystemFrozenError";
  }
}

export class OnChainError extends Error {
  constructor(
    message: string,
    public readonly txSignature?: string,
    public readonly errorCode?: number,
  ) {
    super(message);
    this.name = "OnChainError";
  }
}

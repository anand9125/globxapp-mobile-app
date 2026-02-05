// Shared types across the platform

export type VaultKind = "deposit" | "main" | "withdrawal";

export type LedgerEntryType = "DEPOSIT" | "TRADE" | "WITHDRAWAL" | "FEE" | "ADJUSTMENT";

export type LedgerAccountType =
    | "ASSET_CASH"
    | "ASSET_STOCK"
    | "EQUITY_USER"
    | "EQUITY_SYSTEM"
    | "REVENUE_FEES";

export type LedgerSide = "DEBIT" | "CREDIT";

export type DepositStatus = "PENDING" | "PROCESSING" | "CONFIRMED" | "FAILED" | "CANCELLED";

export type TradeStatus = "PENDING" | "SUBMITTED" | "EXECUTED" | "FAILED" | "CANCELLED";

export type TradeDirection = "BUY" | "SELL";

export type WithdrawalStatus =
    | "PENDING"
    | "APPROVED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";

export type OnChainEventStatus = "TENTATIVE" | "FINALIZED" | "REORGED";

export type OnChainEventType =
    | "depositReceived"
    | "userToVaultDeposit"
    | "depositToMain"
    | "swapExecuted"
    | "swapFailed"
    | "mainToWithdrawal"
    | "vaultToUserWithdrawal"
    | "configUpdated"
    | "vaultPaused"
    | "vaultReconciliation";

export interface LedgerEntryInput {
    entryType: LedgerEntryType;
    transactionId: string;
    userId?: string;
    accountType: LedgerAccountType;
    tokenMint?: string;
    amount: bigint | string;
    side: LedgerSide;
    description?: string;
    metadata?: Record<string, unknown>;
    createdBy?: string;
}

export interface DoubleEntryTransaction {
    transactionId: string;
    entries: Array<{
        userId?: string;
        accountType: LedgerAccountType;
        tokenMint?: string;
        amount: bigint | string;
        side: LedgerSide;
        description?: string;
        metadata?: Record<string, unknown>;
    }>;
    metadata?: Record<string, unknown>;
    createdBy?: string;
}

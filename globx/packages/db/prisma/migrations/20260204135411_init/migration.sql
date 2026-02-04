-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "authProvider" TEXT NOT NULL,
    "authProviderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "kycStatus" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger" (
    "id" BIGSERIAL NOT NULL,
    "entryType" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT,
    "accountType" TEXT NOT NULL,
    "tokenMint" TEXT,
    "amount" DECIMAL(78,0) NOT NULL,
    "side" TEXT NOT NULL,
    "description" TEXT,
    "previousHash" TEXT,
    "entryHash" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_hash_chain" (
    "id" BIGSERIAL NOT NULL,
    "entryId" BIGINT NOT NULL,
    "previousHash" TEXT,
    "entryHash" TEXT NOT NULL,
    "chainPosition" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_hash_chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balances" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "amount" DECIMAL(78,0) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "amount" DECIMAL(78,0) NOT NULL,
    "status" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,
    "onChainTxSig" TEXT,
    "onChainSlot" BIGINT,
    "onChainEventId" BIGINT,
    "depositVaultReceived" BOOLEAN NOT NULL DEFAULT false,
    "mainVaultReceived" BOOLEAN NOT NULL DEFAULT false,
    "sourceAddress" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "inputTokenMint" TEXT NOT NULL,
    "inputAmount" DECIMAL(78,0) NOT NULL,
    "outputTokenMint" TEXT NOT NULL,
    "outputAmount" DECIMAL(78,0) NOT NULL,
    "priceUsd" DECIMAL(20,8),
    "slippageBps" INTEGER,
    "feeAmount" DECIMAL(78,0) NOT NULL,
    "feeTokenMint" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "swapTxSig" TEXT,
    "swapSlot" BIGINT,
    "swapRouteType" TEXT,
    "onChainEventId" BIGINT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "amount" DECIMAL(78,0) NOT NULL,
    "status" TEXT NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "withdrawalId" TEXT,
    "onChainTxSig" TEXT,
    "onChainSlot" BIGINT,
    "onChainEventId" BIGINT,
    "withdrawalVaultSent" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseCode" INTEGER NOT NULL,
    "responseBody" JSONB NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox" (
    "id" BIGSERIAL NOT NULL,
    "eventType" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onchain_events" (
    "id" BIGSERIAL NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDiscriminator" TEXT NOT NULL,
    "txSignature" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,
    "blockTime" BIGINT,
    "programId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TENTATIVE',
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "finalizedAt" TIMESTAMP(3),
    "eventData" JSONB NOT NULL,

    CONSTRAINT "onchain_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_runs" (
    "id" BIGSERIAL NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "totalTokensChecked" INTEGER NOT NULL DEFAULT 0,
    "mismatchesFound" INTEGER NOT NULL DEFAULT 0,
    "mismatches" JSONB,
    "systemFrozen" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "metadata" JSONB,

    CONSTRAINT "reconciliation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "frozenReason" TEXT,
    "frozenAt" TIMESTAMP(3),
    "frozenBy" TEXT,
    "lastProcessedSlot" BIGINT,
    "indexerLagSeconds" INTEGER,
    "reconciliationIntervalMinutes" INTEGER NOT NULL DEFAULT 5,
    "lastReconciliationRunId" BIGINT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_authProvider_authProviderId_idx" ON "users"("authProvider", "authProviderId");

-- CreateIndex
CREATE INDEX "ledger_userId_idx" ON "ledger"("userId");

-- CreateIndex
CREATE INDEX "ledger_transactionId_idx" ON "ledger"("transactionId");

-- CreateIndex
CREATE INDEX "ledger_entryType_idx" ON "ledger"("entryType");

-- CreateIndex
CREATE INDEX "ledger_tokenMint_idx" ON "ledger"("tokenMint");

-- CreateIndex
CREATE INDEX "ledger_createdAt_idx" ON "ledger"("createdAt");

-- CreateIndex
CREATE INDEX "ledger_entryHash_idx" ON "ledger"("entryHash");

-- CreateIndex
CREATE INDEX "ledger_previousHash_idx" ON "ledger"("previousHash");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_hash_chain_entryId_key" ON "ledger_hash_chain"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_hash_chain_entryHash_key" ON "ledger_hash_chain"("entryHash");

-- CreateIndex
CREATE INDEX "ledger_hash_chain_chainPosition_idx" ON "ledger_hash_chain"("chainPosition");

-- CreateIndex
CREATE INDEX "ledger_hash_chain_entryHash_idx" ON "ledger_hash_chain"("entryHash");

-- CreateIndex
CREATE INDEX "balances_userId_idx" ON "balances"("userId");

-- CreateIndex
CREATE INDEX "balances_tokenMint_idx" ON "balances"("tokenMint");

-- CreateIndex
CREATE UNIQUE INDEX "balances_userId_tokenMint_key" ON "balances"("userId", "tokenMint");

-- CreateIndex
CREATE UNIQUE INDEX "deposits_depositId_key" ON "deposits"("depositId");

-- CreateIndex
CREATE INDEX "deposits_userId_idx" ON "deposits"("userId");

-- CreateIndex
CREATE INDEX "deposits_status_idx" ON "deposits"("status");

-- CreateIndex
CREATE INDEX "deposits_depositId_idx" ON "deposits"("depositId");

-- CreateIndex
CREATE INDEX "deposits_onChainTxSig_idx" ON "deposits"("onChainTxSig");

-- CreateIndex
CREATE INDEX "deposits_createdAt_idx" ON "deposits"("createdAt");

-- CreateIndex
CREATE INDEX "trades_userId_idx" ON "trades"("userId");

-- CreateIndex
CREATE INDEX "trades_status_idx" ON "trades"("status");

-- CreateIndex
CREATE INDEX "trades_swapTxSig_idx" ON "trades"("swapTxSig");

-- CreateIndex
CREATE INDEX "trades_inputTokenMint_idx" ON "trades"("inputTokenMint");

-- CreateIndex
CREATE INDEX "trades_outputTokenMint_idx" ON "trades"("outputTokenMint");

-- CreateIndex
CREATE INDEX "trades_createdAt_idx" ON "trades"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_withdrawalId_key" ON "withdrawals"("withdrawalId");

-- CreateIndex
CREATE INDEX "withdrawals_userId_idx" ON "withdrawals"("userId");

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- CreateIndex
CREATE INDEX "withdrawals_withdrawalId_idx" ON "withdrawals"("withdrawalId");

-- CreateIndex
CREATE INDEX "withdrawals_onChainTxSig_idx" ON "withdrawals"("onChainTxSig");

-- CreateIndex
CREATE INDEX "withdrawals_createdAt_idx" ON "withdrawals"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_key_key" ON "idempotency_keys"("key");

-- CreateIndex
CREATE INDEX "idempotency_keys_key_idx" ON "idempotency_keys"("key");

-- CreateIndex
CREATE INDEX "idempotency_keys_userId_idx" ON "idempotency_keys"("userId");

-- CreateIndex
CREATE INDEX "idempotency_keys_expiresAt_idx" ON "idempotency_keys"("expiresAt");

-- CreateIndex
CREATE INDEX "outbox_status_idx" ON "outbox"("status");

-- CreateIndex
CREATE INDEX "outbox_eventType_idx" ON "outbox"("eventType");

-- CreateIndex
CREATE INDEX "outbox_aggregateId_idx" ON "outbox"("aggregateId");

-- CreateIndex
CREATE INDEX "outbox_createdAt_idx" ON "outbox"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "onchain_events_txSignature_key" ON "onchain_events"("txSignature");

-- CreateIndex
CREATE INDEX "onchain_events_eventType_idx" ON "onchain_events"("eventType");

-- CreateIndex
CREATE INDEX "onchain_events_txSignature_idx" ON "onchain_events"("txSignature");

-- CreateIndex
CREATE INDEX "onchain_events_slot_idx" ON "onchain_events"("slot");

-- CreateIndex
CREATE INDEX "onchain_events_status_idx" ON "onchain_events"("status");

-- CreateIndex
CREATE INDEX "onchain_events_programId_idx" ON "onchain_events"("programId");

-- CreateIndex
CREATE INDEX "reconciliation_runs_startedAt_idx" ON "reconciliation_runs"("startedAt");

-- CreateIndex
CREATE INDEX "reconciliation_runs_status_idx" ON "reconciliation_runs"("status");

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balances" ADD CONSTRAINT "balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_onChainEventId_fkey" FOREIGN KEY ("onChainEventId") REFERENCES "onchain_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_onChainEventId_fkey" FOREIGN KEY ("onChainEventId") REFERENCES "onchain_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_onChainEventId_fkey" FOREIGN KEY ("onChainEventId") REFERENCES "onchain_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

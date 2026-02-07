import { Registry, Counter, Gauge, Histogram } from "prom-client";

export const registry = new Registry();

// API Metrics
export const apiRequestCounter = new Counter({
  name: "api_request_total",
  help: "Total number of API requests",
  labelNames: ["method", "path", "status"],
  registers: [registry],
});

// API Request Duration Metrics
export const apiRequestDuration = new Histogram({
  name: "api_request_duration_seconds",
  help: "API request duration in seconds",
  labelNames: ["method", "route"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [registry],
});

// Ledger metrics
export const ledgerEntriesTotal = new Counter({
  name: "ledger_entries_total",
  help: "Total number of ledger entries",
  labelNames: ["entry_type"],
  registers: [registry],
});

// Vault balance metrics
export const vaultBalance = new Gauge({
  name: "vault_balance",
  help: "On-chain vault balance",
  labelNames: ["vault_kind", "token_mint"],
  registers: [registry],
});

// Indexer metrics
export const indexerLag = new Gauge({
  name: "indexer_lag_slots",
  help: "Indexer lag in slots",
  registers: [registry],
});

export const indexerLagSeconds = new Gauge({
  name: "indexer_lag_seconds",
  help: "Indexer lag in seconds",
  registers: [registry],
});

// Reconciliation metrics
export const reconciliationMismatches = new Gauge({
  name: "reconciliation_mismatches",
  help: "Number of reconciliation mismatches",
  labelNames: ["token_mint"],
  registers: [registry],
});

export const systemFrozen = new Gauge({
  name: "system_frozen",
  help: "Whether system is frozen (1 = frozen, 0 = not frozen)",
  registers: [registry],
});

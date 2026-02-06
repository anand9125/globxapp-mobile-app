//Finality checks for Solana transactions
//Events are marked as TENTATIVE until finality is confirmed

import { SolanaClient } from "@repo/solana";

export interface FinalityConfig {
  requiredConfirmations: number; // Default: 32 (finalized)
  checkIntervalMs: number; // How often to check finality
  maxWaitTimeMs: number; // Maximum time to wait for finality
}

//Check if transaction has reached required confirmations

export const DEFAULT_FINALITY_CONFIG: FinalityConfig = {
  requiredConfirmations: 32, // Solana finalized commitment
  checkIntervalMs: 1000, // Check every second
  maxWaitTimeMs: 60000, // Max 60 seconds
};

//Check if transaction has reached required confirmations

export async function checkFinality(
  client: SolanaClient,
  signature: string,
  config: FinalityConfig = DEFAULT_FINALITY_CONFIG,
): Promise<{
  finalized: boolean;
  confirmations: number;
  slot?: number;
}> {
  const status = await client.getSignatureStatus(signature);

  if (!status.value) {
    return { finalized: false, confirmations: 0 };
  }

  const confirmations = status.value.confirmations || 0;
  const slot = status.value.slot || undefined;

  return {
    finalized: confirmations >= config.requiredConfirmations,
    confirmations,
    slot,
  };
}

//Wait for transaction finality

export async function waitForFinality(
  client: SolanaClient,
  signature: string,
  config: FinalityConfig = DEFAULT_FINALITY_CONFIG,
): Promise<{ finalized: boolean; confirmations: number; slot?: number }> {
  const startTime = Date.now();
  while (Date.now() - startTime < config.maxWaitTimeMs) {
    const result = await checkFinality(client, signature, config);
    if (result.finalized) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, config.checkIntervalMs));
  }

  // Timeout - return current status
  return checkFinality(client, signature, config);
}

//Get current slot and calculate lag

export async function getSlotaLag(
  client: SolanaClient,
  eventSlot: number,
): Promise<{
  currentSlot: number;
  lag: number;
  lagSeconds: number;
}> {
  const currentSlot = await client.getLatestSlot();
  const lag = currentSlot - eventSlot;

  // Estimate lag in seconds (assuming ~400ms per slot)
  const lagSeconds = Math.floor(lag * 0.4);
  return {
    currentSlot,
    lag,
    lagSeconds,
  };
}

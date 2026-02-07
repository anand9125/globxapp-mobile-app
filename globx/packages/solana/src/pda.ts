import { PublicKey } from "@solana/web3.js";
import { getProgramId } from "./idl";
import { VaultKind } from "@repo/shared";

const VAULT_SEED = "vault";
const CONFIG_SEED = "config";
const TREASURY_SEED = "treasury";
const PROPOSAL_COUNTER_SEED = "proposal_counter";

// Derive vault PDA address
export async function deriveVaultPDA(
  vaultKind: VaultKind,
): Promise<[PublicKey, number]> {
  const programId = new PublicKey(getProgramId());

  const seeds = [Buffer.from(VAULT_SEED), Buffer.from(vaultKind)];

  return PublicKey.findProgramAddressSync(seeds, programId);
}

// Derive deposit vault PDA
export async function deriveDepositVaultPDA(): Promise<[PublicKey, number]> {
  return deriveVaultPDA("deposit");
}

// Derive main vault PDA
export async function deriveMainVaultPDA(): Promise<[PublicKey, number]> {
  return deriveVaultPDA("main");
}

// Derive withdrawal vault PDA
export async function deriveWithdrawalVaultPDA(): Promise<[PublicKey, number]> {
  return deriveVaultPDA("withdrawal");
}

// Derive config PDA
export async function deriveConfigPDA(): Promise<[PublicKey, number]> {
  const programId = new PublicKey(getProgramId());
  const seeds = [Buffer.from(CONFIG_SEED)];
  return PublicKey.findProgramAddressSync(seeds, programId);
}

// Derive treasury PDA
export async function deriveTreasuryPDA(): Promise<[PublicKey, number]> {
  const programId = new PublicKey(getProgramId());
  const seeds = [Buffer.from(TREASURY_SEED)];
  return PublicKey.findProgramAddressSync(seeds, programId);
}

// Derive proposal counter PDA
export async function deriveProposalCounterPDA(): Promise<[PublicKey, number]> {
  const programId = new PublicKey(getProgramId());
  const seeds = [Buffer.from(PROPOSAL_COUNTER_SEED)];
  return PublicKey.findProgramAddressSync(seeds, programId);
}

// Derive vault token account (ATA) PDA
export async function deriveVaultTokenAccountPDA(
  vaultPDA: PublicKey,
  tokenMint: PublicKey,
): Promise<PublicKey> {
  const TOKEN_PROGRAM_ID = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  );
  const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  );
  const [address] = PublicKey.findProgramAddressSync(
    [vaultPDA.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return address;
}

// Trasnsaction builders for the Globx program

import { Transaction, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { SolanaClient } from "./client";
import {
  deriveDepositVaultPDA,
  deriveMainVaultPDA,
  deriveWithdrawalVaultPDA,
  deriveConfigPDA,
  deriveTreasuryPDA,
  deriveVaultTokenAccountPDA,
} from "./pda";
import { GlobxIDL, getProgramId } from "./idl";
import { JupiterAccountMeta } from "./jupiter";

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

export interface DepositTransactionParams {
  userSourceAddress: PublicKey; // User's source wallet address
  tokenMint: PublicKey; // SPL token mint address
  amount: BN;
  depositId: Buffer; // 32-byte deposit ID
}

export interface SwapTransactionParams {
  userId: Buffer; // User's ID
  inputMint: PublicKey;
  outputMint: PublicKey;
  amountIn: bigint;
  amountUsd: bigint;
  minAmountOut: bigint;
  slippageBps: number;
  routeType: "Jupiter" | "Other";
  routeData: Buffer; // Route data for the swap
}

export interface WithdrawalTransactionParams {
  destinationAccount: PublicKey; // User's destination wallet address
  tokenMint: PublicKey;
  amount: BN;
  withdrawalId: Buffer; // 32-byte withdrawal ID
}

export async function buildUserToDepositTransaction(
  client: SolanaClient,
  params: DepositTransactionParams,
): Promise<Transaction> {
  const programId = new PublicKey(getProgramId());
  const [depositVault] = await deriveDepositVaultPDA();
  const [config] = await deriveConfigPDA();
  const vaultTokenAccount = await deriveVaultTokenAccountPDA(
    depositVault,
    params.tokenMint,
  );

  const provider = new AnchorProvider(client.connection, {} as any, {
    commitment: client.commitment,
  });
  const program = new Program(
    GlobxIDL as any,
    programId as any,
    provider as any,
  );

  const instruction = await (program as any).methods
    .user_to_deposit({
      amount: new BN(params.amount.toString()),
      depositId: Array.from(params.depositId),
    })
    .accounts({
      authority: PublicKey.default,
      config: config,
      depositVault: depositVault,
      vaultTokenAccount: vaultTokenAccount,
      sourceTokenAccount: params.userSourceAddress,
      tokenMint: params.tokenMint,
      tokneProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  const transaction = new Transaction();
  transaction.add(instruction);

  return transaction;
}

// deposit to Vault Transaction

export async function buildDepositToVaultTransaction(
  client: SolanaClient,
  tokenMint: PublicKey,
  amount: bigint,
  transferId: Buffer,
): Promise<Transaction> {
  const programId = new PublicKey(getProgramId());
  const [depositVault] = await deriveDepositVaultPDA();
  const [mainVault] = await deriveMainVaultPDA();
  const [config] = await deriveConfigPDA();
  const depositTokenAccount = await deriveVaultTokenAccountPDA(
    depositVault,
    tokenMint,
  );
  const mainTokenAccount = await deriveVaultTokenAccountPDA(
    mainVault,
    tokenMint,
  );

  const program = new Program(GlobxIDL as any, programId as any, {} as any);

  const instruction = await (program as any).methods
    .deposit_to_vault({
      amount: new BN(amount.toString()),
      transferId: Array.from(transferId),
    })
    .accounts({
      authority: PublicKey.default,
      config: config,
      depositVault: depositVault,
      mainVault: mainVault,
      depositTokenAccount: depositTokenAccount,
      mainTokenAccount: mainTokenAccount,
      tokenMint: tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  const transaction = new Transaction();
  transaction.add(instruction);

  return transaction;
}

export async function buildSwapTransaction(
  client: SolanaClient,
  params: SwapTransactionParams,
  jupiterProgramId: PublicKey,
  jupiterAccountMetas: JupiterAccountMeta[],
): Promise<Transaction> {
  const programId = new PublicKey(getProgramId());
  const [mainVault] = await deriveMainVaultPDA();
  const [config] = await deriveConfigPDA();
  const [treasury] = await deriveTreasuryPDA();
  const vaultInputToken = await deriveVaultTokenAccountPDA(mainVault, params.inputMint);
  const vaultOutputToken = await deriveVaultTokenAccountPDA(mainVault, params.outputMint);
  const treasuryInputToken = await deriveVaultTokenAccountPDA(treasury, params.inputMint);

  const provider = new AnchorProvider(client.connection, {} as any, {
    commitment: client.commitment,
  });

  const program = new Program(
    GlobxIDL as any,
    programId as any,
    provider as any,
  );

  const instruction = await (program as any).methods
    .executeSwap({
      amountIn: new BN(params.amountIn.toString()),
      amountUsd: new BN(params.amountUsd.toString()),
      minAmountOut: new BN(params.minAmountOut.toString()),
      expectedOutputAmount: null,
      slippageBps: params.slippageBps,
      userId: Array.from(params.userId),
      routeType: { jupiter: {} },
      data: Array.from(params.routeData),
    })
    .accounts({
      vault: mainVault,
      vaultInputToken,
      vaultOutputToken,
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      config,
      treasury,
      treasuryInputToken,
      swapProgram: jupiterProgramId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .remainingAccounts(
      jupiterAccountMetas.map((acc) => ({
        pubkey: acc.pubkey,
        isWritable: acc.isWritable,
        isSigner: acc.isSigner,
      })),
    )
    .instruction();

  const transaction = new Transaction();
  transaction.add(instruction);

  return transaction;
}

export async function buildMaintToWithdrawalTransaction(
  client: SolanaClient,
  tokenMint: PublicKey,
  amount: bigint,
  transferId: Buffer,
): Promise<Transaction> {
  const programId = new PublicKey(getProgramId());
  const [mainVault] = await deriveMainVaultPDA();
  const [withdrawalVault] = await deriveWithdrawalVaultPDA();
  const [config] = await deriveConfigPDA();
  const mainTokenAccount = await deriveVaultTokenAccountPDA(
    mainVault,
    tokenMint,
  );
  const withdrawalTokenAccount = await deriveVaultTokenAccountPDA(
    withdrawalVault,
    tokenMint,
  );

  const provider = new AnchorProvider(client.connection, {} as any, {
    commitment: client.commitment,
  });
  const program = new Program(
    GlobxIDL as any,
    programId as any,
    provider as any,
  );

  const instruction = await (program as any).methods
    .mainToWithdrawal({
      amount: new BN(amount.toString()),
      transferId: Array.from(transferId),
    })
    .accounts({
      authority: PublicKey.default,
      config: config,
      mainVault: mainVault,
      withdrawalVault: withdrawalVault,
      mainTokenAccount: mainTokenAccount,
      withdrawalTokenAccount: withdrawalTokenAccount,
      tokenMint: tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  const transaction = new Transaction();
  transaction.add(instruction);

  return transaction;
}

export async function buildWithdrawalToUserTransaction(
  client: SolanaClient,
  params: WithdrawalTransactionParams,
): Promise<Transaction> {
  const programId = new PublicKey(getProgramId());
  const [withdrawalVault] = await deriveWithdrawalVaultPDA();
  const [config] = await deriveConfigPDA();
  const vaultTokenAccount = await deriveVaultTokenAccountPDA(
    withdrawalVault,
    params.tokenMint,
  );
  const provider = new AnchorProvider(client.connection, {} as any, {
    commitment: client.commitment,
  });
  const program = new Program(
    GlobxIDL as any,
    programId as any,
    provider as any,
  );

  const instruction = await (program as any).methods
    .withdrawalToUser({
      amount: new BN(params.amount.toString()),
      withdrawalId: Array.from(params.withdrawalId),
    })
    .accounts({
      authority: PublicKey.default,
      config: config,
      withdrawalVault: withdrawalVault,
      vaultTokenAccount: vaultTokenAccount,
      destinationTokenAccount: params.destinationAccount,
      tokenMint: params.tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  const transaction = new Transaction();
  transaction.add(instruction);

  return transaction;
}
export interface HSMSigner {
  signTransaction(transaction: Transaction): Promise<Transaction>;
  getPublicKey(): Promise<PublicKey>;
}

export class MockHSMSigner implements HSMSigner {
  constructor(private keypair: any) {} // Keypair type from @solana/web3.js

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    transaction.sign(this.keypair);
    return transaction;
  }

  async getPublicKey(): Promise<PublicKey> {
    return this.keypair.publicKey;
  }
}


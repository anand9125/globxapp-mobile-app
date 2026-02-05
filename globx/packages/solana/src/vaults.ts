import { PublicKey } from "@solana/web3.js";
import { SolanaClient } from "./client";
import { deriveVaultPDA, deriveVaultTokenAccountPDA } from "./pda";
import type { VaultKind } from "@repo/shared";
import { BN } from "@coral-xyz/anchor";

export interface VaultsState {
    bump: number;
    initializedAt: BN;
    kind: VaultKind;
    paused: boolean;
    totalIn: BN;
    totalOut: BN;
    lastTransferAt: BN | null;
}

export async function getVaultsState(client: SolanaClient, vault_kind: VaultKind): Promise<VaultsState | null> {
    const [vaultPDA, bumpSeed] = await deriveVaultPDA(vault_kind);
    const accountInfo = await client.connection.getAccountInfo(vaultPDA);


    if (!accountInfo) {
        return null;
    }

    // Parse VaultState account data
    // Discriminator: 8 bytes
    // bump: u8 (1 byte)
    // initialized_at: i64 (8 bytes)
    // kind: VaultKind enum (1 byte)
    // paused: bool (1 byte)
    // total_in: u64 (8 bytes)
    // total_out: u64 (8 bytes)
    // last_transfer_at: Option<i64> (1 + 8 bytes)

    const data = accountInfo.data;
    let offset = 8; // Skip discriminator

    const bump: number = data[offset++] ?? 0;
    const initializedAt = new BN(data.slice(offset, offset + 8), undefined, "le");
    offset += 8;

    const kindValue = data[offset++];
    const kind: VaultKind = kindValue === 0 ? "deposit" : kindValue === 1 ? "main" : "withdrawal";

    const paused: boolean = data[offset++] === 1;
    const totalIn = new BN(data.slice(offset, offset + 8), undefined, "le");
    offset += 8;
    const totalOut = new BN(data.slice(offset, offset + 8), "le");
    offset += 8;

    const hasLastTransfer = data[offset++] === 1;
    const lastTransferAt = hasLastTransfer ? new BN(data.slice(offset, offset + 8), "le") : null;

    return {
        bump,
        initializedAt,
        kind,
        paused,
        totalIn,
        totalOut,
        lastTransferAt, //todo - solev
    };
}


export async function getVaultTokenBalance(client: SolanaClient, vault_kind: VaultKind, tokenMint: PublicKey): Promise<bigint> {
    const [vaultPda] = await deriveVaultPDA(vault_kind);
    const tokenAccount = await deriveVaultTokenAccountPDA(vaultPda, tokenMint);

    const balance = await client.connection.getTokenAccountBalance(tokenAccount);

    if (!balance.value) {
        return BigInt(0);
    }

    return BigInt(balance.value.amount);
}

export async function getAllVaultBalance(
    client: SolanaClient,
    tokenMint: PublicKey
): Promise<{
    deposit: bigint;
    main: bigint;
    withdrawal: bigint;
    total: bigint;
}> {
    const [deposit, main, withdrawal] = await Promise.all([
        getVaultTokenBalance(client, "deposit", tokenMint),
        getVaultTokenBalance(client, "main", tokenMint),
        getVaultTokenBalance(client, "withdrawal", tokenMint),
    ])

    return {
        deposit,
        main,
        withdrawal,
        total: deposit + main + withdrawal,
    };
}


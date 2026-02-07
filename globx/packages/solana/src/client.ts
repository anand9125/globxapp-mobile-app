// Solana Client for interacting with the Solana blockchain
import {
  Connection,
  PublicKey,
  Commitment,
  Transaction,
} from "@solana/web3.js";

// Solana Config for connecting to the Solana blockchain
export interface SolanaConfig {
  rpcUrl: string;
  commitment?: Commitment;
  wsEndpoint?: string;
}

export class SolanaClient {
  // Connection to the Solana blockchain
  public readonly connection: Connection;

  // Commitment to the Solana blockchain
  public readonly commitment: Commitment;

  // Constructor for the Solana Client
  constructor(config: SolanaConfig) {
    this.commitment = config.commitment || "confirmed";
    this.connection = new Connection(config.rpcUrl, {
      commitment: this.commitment,
      wsEndpoint: config.wsEndpoint,
    });
  }

  // Get Latest Slot
  async getLatestSlot(): Promise<number> {
    return this.connection.getSlot(this.commitment);
  }

  // Get Block Time for Slot
  async getBlockTime(slot: number): Promise<number | null> {
    return this.connection.getBlockTime(slot);
  }

  // Get transaction signature status
  async getSignatureStatus(signature: string) {
    return this.connection.getSignatureStatus(signature);
  }

  // Get account info
  async getAccountInfo(pubkey: PublicKey) {
    return this.connection.getAccountInfo(pubkey, this.commitment);
  }

  // Get token account balance
  async getTokenAccountBalance(tokenAccount: PublicKey) {
    return this.connection.getTokenAccountBalance(
      tokenAccount,
      this.commitment,
    );
  }

  // Simulate transaction
  async simulateTransaction(transaction: any) {
    return this.connection.simulateTransaction(transaction, {
      commitment: this.commitment,
    });
  }

  // Build and Simulate Transaction
  async buildAndSimulateTransaction(
    instructions: any[],
    signers: PublicKey[] = [],
  ) {
    // Build Transaction
    const transaction = new Transaction();

    // Add Instructions to Transaction
    for (const ix of instructions) {
      transaction.add(ix);
    }

    // Get Recent Blockhash
    const { blockhash } = await this.connection.getLatestBlockhash(
      this.commitment,
    );
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = signers[0] || PublicKey.default;

    // Simulate Transaction
    const simulation = await this.simulateTransaction(transaction);

    // Return Transaction and Simulation
    return {
      transaction,
      simulation,
    };
  }
}

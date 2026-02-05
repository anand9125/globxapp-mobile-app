import { AnchorError, AnchorProvider, Program } from "@coral-xyz/anchor";
import { getProgramId, GlobxIDL, PublicKey, SolanaClient } from "@repo/solana";
import { PrismaClient } from "../../db/src";
import { LedgerService } from "@repo/ledger";
import { logger } from "./logger";

export interface IndexerConfig {
  reorgCheckIntervalMs: number;
  finalityCheckIntervalMs: number;
}

export const DEFAULT_INDEXER_CONFIG: IndexerConfig = {
  reorgCheckIntervalMs: 30000, // Check every 30 seconds
  finalityCheckIntervalMs: 5000, // Check every 5 seconds
};

export class IndexerService {
    private program: Program<any>;
    private eventListener: Map<string, any> = new Map();
    private reorgCheckInterval?: NodeJS.Timeout;
    private finalityCheckInterval?: NodeJS.Timeout;

    constructor(
        private client: SolanaClient,
        private prisma: PrismaClient,
        private ledgerService: LedgerService,
        private config: IndexerConfig = DEFAULT_INDEXER_CONFIG,
    )
    {
        const provider = new AnchorProvider(
            client.connection,
            {} as any, // No wallet needed for event listening
            { commitment: "confirmed" }
        );
        this.program = new Program(GlobxIDL as any, new PublicKey(getProgramId()) as any , provider as any);
    }

    //Start listening to on-chain events

    async start(): Promise<void>{
        logger.info("Starting indexer service");
        this.program.addEventListener("depositReceived", async (event: any, slot: number, signature: string) => {
            await this.handleEvent("depositReceived", event, slot, signature);
          });
      
          this.program.addEventListener("userToVaultDeposit", async (event: any, slot: number, signature: string) => {
            await this.handleEvent("userToVaultDeposit", event, slot, signature);
          });
      
          this.program.addEventListener("depositToMain", async (event: any, slot: number, signature: string) => {
            await this.handleEvent("depositToMain", event, slot, signature);
          });
      
          this.program.addEventListener("swapExecuted", async (event: any, slot: number, signature: string) => {
            await this.handleEvent("swapExecuted", event, slot, signature);
          });
      
          this.program.addEventListener("swapFailed", async (event: any, slot: number, signature: string) => {
            await this.handleEvent("swapFailed", event, slot, signature);
          });
      
          this.program.addEventListener("mainToWithdrawal", async (event: any, slot: number, signature: string) => {
            await this.handleEvent("mainToWithdrawal", event, slot, signature);
          });
      
          this.program.addEventListener("vaultToUserWithdrawal", async (event: any, slot: number, signature: string) => {
            await this.handleEvent("vaultToUserWithdrawal", event, slot, signature);
          });
      
          // Start reorg checking
          this.reorgCheckInterval = setInterval(async () => {
            try {
              await checkForReorgs(this.prisma, this.client, this.ledgerService);
            } catch (error) {
              logger.error({ error: error instanceof Error ? error.message : String(error) }, "Error checking for reorgs");
            }
          }, this.config.reorgCheckIntervalMs);
      
          // Start finality checking for tentative events
          this.finalityCheckInterval = setInterval(async () => {
            try {
              await this.checkTentativeEventsFinality();
            } catch (error) {
              logger.error({ error: error instanceof Error ? error.message : String(error) }, "Error checking finality");
            }
          }, this.config.finalityCheckIntervalMs);
      
          logger.info("Indexer service started");
    }

    //Stop listening to events

    async stop(): Promise<void> {
        logger.info("Stopping indexer service");

        // Remove all event listeners
        for (const [eventName , listener] of this.eventListener.entries()){
            this.program.removeEventListener(listener);
        }

        this.eventListener.clear();

        // Clear intervals
        if (this.reorgCheckInterval){
            clearInterval(this.reorgCheckInterval);
        }
        if (this.finalityCheckInterval){
            clearInterval(this.finalityCheckInterval);
        }

        logger.info("Indexer service stopped");
    }

    //Handle a single event

    private async handleEvent(entryType: string, eventData: any, slot: number, signature: string): Promise<void>{
        try{
            const blockTime = await this.client.getBlockTime(slot);

            // Process event and store in DB
            
        } catch {
            
        }
    }
}
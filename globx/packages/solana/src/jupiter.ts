//Jupiter Aggregator API client: fetch quote and swap instructions for CPI

import { PublicKey } from "@solana/web3.js";

// Add at the top
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const isDevnet = SOLANA_RPC_URL.includes("devnet");

// Replace the hardcoded line
const JUPITER_API_BASE = isDevnet 
  ? process.env.JUPITER_API_BASE_DEVNET || "https://quote-api.jup.ag/v6/"  // Verify devnet endpoint
  : process.env.JUPITER_API_BASE || "https://api.jup.ag/";

export interface JupiterQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps: number;
  // Restrict intermediate tokens to the ones that are supported by the swap
  restrictIntermediateTokens?: boolean;
  // Max number of accounts to use for the swap( default 64)
  maxAccounts?: number;
}

export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: number;
  outputMint: string;
  outAmount: number;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
    };
    percent: number;
  }>;
  contextSlot?: number;
  timeTaken?: number;
}

export interface JupiterSwapInstructionAccount {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}

export interface JupiterSwapInstruction {
  programId: string;
  accounts: JupiterSwapInstructionAccount[];
  data: string; //base 64
}

export interface JupiterSwapInstructionsResponse {
  computeBudgetInstructions: Array<{
    programId: string;
    accounts: unknown[];
    data: string;
  }>;
  setupInstructions: Array<{
    programId: string;
    accounts: JupiterSwapInstructionAccount[];
    data: string;
  }>;
  swapInstruction: JupiterSwapInstruction;
  cleanupInstruction: unknown;
  otherInstructions: unknown[];
  addressLookupTableAddresses?: string[];
}

export interface JupiterFetchQuoteOptions {
  apiKey?: string;
}

//Fetch best quote from Jupiter for given input/output and amount

export async function fetchJupiterQuote(
  params: JupiterQuoteParams,
  options?: JupiterFetchQuoteOptions,
): Promise<JupiterQuoteResponse> {
  const url = new URL(`${JUPITER_API_BASE}/swap/v1/quote`);
  url.searchParams.set("inputMint", params.inputMint);
  url.searchParams.set("outputMint", params.outputMint);
  url.searchParams.set("amount", params.amount.toString());
  url.searchParams.set("slippageBps", params.slippageBps.toString());
  url.searchParams.set(
    "restrictIntermediateTokens",
    params.restrictIntermediateTokens ? "true" : "false",
  );
  url.searchParams.set("maxAccounts", params.maxAccounts?.toString() || "64");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options?.apiKey) {
    headers["x-api-key"] = options.apiKey;
  }
  const response = await fetch(url.toString(), {
    headers,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch Jupiter quote: ${text}`);
  }
  return (await response.json()) as JupiterQuoteResponse;
}

export interface JupiterGetSwapInstructionsParams {
    quoteResponse: JupiterQuoteResponse;
    // Public key of the "user" for the swap (token account owner). For CPI use main vault PDA. 
    userPublicKey: string;
}

//Get swap instructions from Jupiter for building a transaction.
//For Globx CPI: pass mainVaultPda as userPublicKey so Jupiter returns instructions
//that debit/credit the vault's token accounts.

export async function getJupiterSwapInstructions(
    params: JupiterGetSwapInstructionsParams,
    options?: JupiterFetchQuoteOptions,
): Promise<JupiterSwapInstructionsResponse> {
    const url = new URL(`${JUPITER_API_BASE}/swap/v1/swap-instructions`);
    url.searchParams.set("quoteResponse", JSON.stringify(params.quoteResponse));
    const body = {
        quoteResponse: params.quoteResponse,
        userPublicKey: params.userPublicKey,
      };
    
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (options?.apiKey) {
        headers["x-api-key"] = options.apiKey;
      }
    
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Jupiter swap-instructions failed (${res.status}): ${text}`);
      }
      return res.json() as Promise<JupiterSwapInstructionsResponse>;
    }
    
    export interface JupiterAccountMeta {
      pubkey: PublicKey;
      isSigner: boolean;
      isWritable: boolean;
    }
    
    //Decode Jupiter swap instruction for CPI: programId, account metas, and instruction data buffer

    export function decodeJupiterSwapInstructionForCPI(swapInstruction: JupiterSwapInstruction): {
        programId: PublicKey;
        accounts: JupiterAccountMeta[];
        data: Buffer;
      } {
        const programId = new PublicKey(swapInstruction.programId);
        const accounts: JupiterAccountMeta[] = swapInstruction.accounts.map((a) => ({
          pubkey: new PublicKey(a.pubkey),
          isSigner: a.isSigner,
          isWritable: a.isWritable,
        }));
        const data = Buffer.from(swapInstruction.data, "base64");
        return { programId, accounts, data };
      }


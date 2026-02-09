// Token definitions matching the smart contract architecture
// Based on constants.rs from the GlobX program

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  category: "stablecoin" | "native" | "tokenized_stock";
}

// Stablecoins
export const USDC: TokenInfo = {
  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  category: "stablecoin",
};

// Native Solana
export const SOL: TokenInfo = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  category: "native",
};

// Tokenized Stocks (Backed Finance)
// These tokens represent 1:1 backed shares of real stocks
export const TOKENIZED_STOCKS: TokenInfo[] = [
  {
    mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
    symbol: "xxTSLA",
    name: "Tesla",
    decimals: 8,
    category: "tokenized_stock",
  },
  {
    mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
    symbol: "xxAAPL",
    name: "Apple",
    decimals: 8,
    category: "tokenized_stock",
  },
  {
    mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
    symbol: "xxGOOGL",
    name: "Alphabet",
    decimals: 8,
    category: "tokenized_stock",
  },
  {
    mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
    symbol: "xxAMZN",
    name: "Amazon",
    decimals: 8,
    category: "tokenized_stock",
  },
  {
    mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
    symbol: "xxMSFT",
    name: "Microsoft",
    decimals: 8,
    category: "tokenized_stock",
  },
  {
    mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
    symbol: "xxNVDA",
    name: "NVIDIA",
    decimals: 8,
    category: "tokenized_stock",
  },
];

// All available tokens
export const ALL_TOKENS: TokenInfo[] = [USDC, SOL, ...TOKENIZED_STOCKS];

// Token lookup by mint address
export const TOKEN_MAP: Record<string, TokenInfo> = ALL_TOKENS.reduce(
  (acc, token) => {
    acc[token.mint] = token;
    return acc;
  },
  {} as Record<string, TokenInfo>
);

// Get token info by mint address
export function getTokenInfo(mint: string): TokenInfo {
  return (
    TOKEN_MAP[mint] || {
      mint,
      symbol: mint.slice(0, 4) + "..." + mint.slice(-4),
      name: "Unknown Token",
      decimals: 6,
      category: "stablecoin",
    }
  );
}

// Constants from smart contract
export const PLATFORM_FEE_BPS = 50; // 0.5%
export const DEFAULT_MAX_SLIPPAGE_BPS = 100; // 1%
export const MAX_SLIPPAGE_BPS = 1000; // 10%
export const MIN_SLIPPAGE_BPS = 1; // 0.01%
export const DEFAULT_MAX_TRADE_USD = 10_000; // $10,000
export const DEFAULT_DAILY_VOLUME_CAP = 100_000; // $100,000
export const MIN_DEPOSIT_AMOUNT = 1.0; // $1.00
export const MIN_TRADE_AMOUNT = 1.0; // $1.00

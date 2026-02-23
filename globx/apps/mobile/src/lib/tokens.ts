// Token definitions matching the web app / smart contract architecture

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  category: "stablecoin" | "native" | "tokenized_stock";
}

export const USDC: TokenInfo = {
  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  category: "stablecoin",
};

export const SOL: TokenInfo = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  category: "native",
};

export const TOKENIZED_STOCKS: TokenInfo[] = [
  { mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB", symbol: "xxTSLA", name: "Tesla", decimals: 8, category: "tokenized_stock" },
  { mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp", symbol: "xxAAPL", name: "Apple", decimals: 8, category: "tokenized_stock" },
  { mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN", symbol: "xxGOOGL", name: "Alphabet", decimals: 8, category: "tokenized_stock" },
  { mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg", symbol: "xxAMZN", name: "Amazon", decimals: 8, category: "tokenized_stock" },
  { mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX", symbol: "xxMSFT", name: "Microsoft", decimals: 8, category: "tokenized_stock" },
  { mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh", symbol: "xxNVDA", name: "NVIDIA", decimals: 8, category: "tokenized_stock" },
];

export const ALL_TOKENS: TokenInfo[] = [USDC, SOL, ...TOKENIZED_STOCKS];

export const TOKEN_MAP: Record<string, TokenInfo> = ALL_TOKENS.reduce(
  (acc, token) => {
    acc[token.mint] = token;
    return acc;
  },
  {} as Record<string, TokenInfo>
);

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

export const PLATFORM_FEE_BPS = 50;
export const DEFAULT_MAX_SLIPPAGE_BPS = 100;
export const MAX_SLIPPAGE_BPS = 1000;
export const MIN_SLIPPAGE_BPS = 1;
export const MIN_DEPOSIT_AMOUNT = 1.0;
export const MIN_TRADE_AMOUNT = 1.0;

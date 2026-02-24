// Match web app tokens (Backed Finance tokenized stocks + USDC)
export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  category: "stablecoin" | "native" | "tokenized_stock";
}

export const USDC: TokenInfo = {
  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  category: "stablecoin",
};

export const TOKENIZED_STOCKS: TokenInfo[] = [
  { mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB", symbol: "xxTSLA", name: "Tesla", decimals: 8, category: "tokenized_stock" },
  { mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp", symbol: "xxAAPL", name: "Apple", decimals: 8, category: "tokenized_stock" },
  { mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN", symbol: "xxGOOGL", name: "Alphabet", decimals: 8, category: "tokenized_stock" },
  { mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg", symbol: "xxAMZN", name: "Amazon", decimals: 8, category: "tokenized_stock" },
  { mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX", symbol: "xxMSFT", name: "Microsoft", decimals: 8, category: "tokenized_stock" },
  { mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh", symbol: "xxNVDA", name: "NVIDIA", decimals: 8, category: "tokenized_stock" },
];

export const TOKEN_MAP: Record<string, TokenInfo> = [USDC, ...TOKENIZED_STOCKS].reduce(
  (acc, t) => {
    acc[t.mint] = t;
    return acc;
  },
  {} as Record<string, TokenInfo>
);

export function getTokenInfo(mint: string): TokenInfo {
  return (
    TOKEN_MAP[mint] ?? {
      mint,
      symbol: mint.slice(0, 4) + "..." + mint.slice(-4),
      name: "Unknown",
      decimals: 6,
      category: "stablecoin",
    }
  );
}

import { useQuery } from "@tanstack/react-query";
import { getPortfolio, getTradeQuote } from "../lib/api";
import { USDC, TOKEN_MAP } from "../lib/tokens";

export function usePortfolioWithPrices(userId: string | undefined, token: string | undefined) {
  const portfolioQuery = useQuery({
    queryKey: ["portfolio", userId, token],
    queryFn: () => getPortfolio(userId!, token!),
    enabled: !!userId && !!token,
    staleTime: 30000,
  });

  const balances = portfolioQuery.data?.balances ?? [];
  const totalValue =
    portfolioQuery.isLoading || !portfolioQuery.data
      ? null
      : balances.reduce((sum, b) => {
          const info = TOKEN_MAP[b.tokenMint];
          if (!info) return sum;
          const amount = parseFloat(b.amount) / Math.pow(10, info.decimals);
          if (b.tokenMint === USDC.mint) return sum + amount;
          return sum; // non-USDC value added when we have prices
        }, 0);

  return {
    portfolio: portfolioQuery.data,
    balances,
    totalValueUsdcOnly: totalValue,
    isLoading: portfolioQuery.isLoading,
    refetch: portfolioQuery.refetch,
  };
}

export function usePriceForMint(
  token: string | undefined,
  outputTokenMint: string | undefined,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["price", outputTokenMint, token],
    queryFn: () =>
      getTradeQuote(token!, {
        inputTokenMint: USDC.mint,
        outputTokenMint: outputTokenMint!,
        amount: String(1e6), // 1 USDC
        slippageBps: 50,
      }),
    enabled: !!token && !!outputTokenMint && enabled,
    staleTime: 60000,
  });
}

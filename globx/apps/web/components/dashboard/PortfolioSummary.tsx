"use client";

import { usePrices } from "@/contexts/price-context";
import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { TOKENIZED_STOCKS, TOKEN_MAP, USDC } from "@/lib/tokens";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PortfolioSummaryProps {
  userId: string;
}

export function PortfolioSummary({ userId }: PortfolioSummaryProps) {
  const { token } = useAuthToken();
  const prices = usePrices();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio", userId, token],
    queryFn: () => getPortfolio(userId, token!),
    enabled: !!userId && !!token,
    ...{ staleTime: 30000, refetchInterval: false }, // WebSocket updates
  });

  // Calculate total portfolio value
  const totalValue = portfolio?.balances.reduce((sum, balance) => {
    const tokenInfo = TOKEN_MAP[balance.tokenMint];
    if (!tokenInfo) return sum;

    const amount = parseFloat(balance.amount) / Math.pow(10, tokenInfo.decimals);
    
    if (balance.tokenMint === USDC.mint) {
      return sum + amount;
    }

    // Get price from WebSocket
    const priceData = prices[balance.tokenMint];
    const price = priceData?.price || 0;
    
    return sum + amount * price;
  }, 0) || 0;

  // Calculate 24h change (mock for now, would come from backend)
  const change24h = 2.45;
  const changePercent24h = 1.92;
  const isPositive = change24h >= 0;

  return (
    <div className="bg-bg-secondary border border-border rounded-2xl p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 via-transparent to-accent-buy/10" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-2">
              Total Portfolio Value
            </div>
            {isLoading ? (
              <div className="h-12 w-64 bg-bg-tertiary animate-pulse rounded" />
            ) : (
              <div className="text-5xl md:text-6xl font-bold font-mono text-text-primary mb-2">
                {formatCurrency(totalValue)}
              </div>
            )}
            <div className={`flex items-center gap-2 text-lg font-semibold ${
              isPositive ? "text-accent-buy" : "text-accent-sell"
            }`}>
              {isPositive ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <span>
                {isPositive ? "+" : ""}{formatCurrency(change24h)} ({isPositive ? "+" : ""}{changePercent24h}%) today
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period) => (
              <button
                key={period}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === "1D"
                    ? "bg-accent-primary text-white"
                    : "bg-bg-tertiary text-text-secondary hover:bg-bg-secondary"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

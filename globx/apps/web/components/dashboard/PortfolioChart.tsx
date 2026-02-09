"use client";

import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { TOKEN_MAP, USDC } from "@/lib/tokens";
import { usePrices } from "@/contexts/price-context";
import { useMemo } from "react";

interface PortfolioChartProps {
  userId: string;
}

export function PortfolioChart({ userId }: PortfolioChartProps) {
  const { token } = useAuthToken();
  const prices = usePrices();

  const { data: portfolio } = useQuery({
    queryKey: ["portfolio", userId, token],
    queryFn: () => getPortfolio(userId, token!),
    enabled: !!userId && !!token,
    ...{ staleTime: 30000, refetchInterval: false },
  });

  // Generate mock historical data for chart
  // In production, this would come from backend
  const chartData = useMemo(() => {
    const data = [];
    const now = Date.now();
    const totalValue = portfolio?.balances.reduce((sum, balance) => {
      const tokenInfo = TOKEN_MAP[balance.tokenMint];
      if (!tokenInfo) return sum;
      const amount = parseFloat(balance.amount) / Math.pow(10, tokenInfo.decimals);
      if (balance.tokenMint === USDC.mint) {
        return sum + amount;
      }
      const priceData = prices[balance.tokenMint];
      const price = priceData?.price || 0;
      return sum + amount * price;
    }, 0) || 0;

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const value = totalValue * (1 + (Math.random() - 0.5) * 0.1);
      data.push({
        date: date.toISOString().split("T")[0],
        value: Math.max(0, value),
      });
    }
    return data;
  }, [portfolio, prices]);

  return (
    <div className="bg-bg-secondary border border-border rounded-2xl p-6 h-[300px]">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Portfolio Performance</h3>
      <div className="h-full flex items-center justify-center text-text-secondary">
        {/* Chart would be rendered here using recharts or similar */}
        <div className="text-center">
          <p className="text-sm mb-2">Chart visualization</p>
          <p className="text-xs text-text-muted">
            {chartData.length} data points ready
          </p>
        </div>
      </div>
    </div>
  );
}

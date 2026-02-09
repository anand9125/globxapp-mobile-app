"use client";

import { usePrices } from "@/contexts/price-context";
import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { TOKEN_MAP, USDC } from "@/lib/tokens";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatTokenAmount } from "@/lib/utils";

interface HoldingsTableProps {
  userId: string;
}

export function HoldingsTable({ userId }: HoldingsTableProps) {
  const { token } = useAuthToken();
  const prices = usePrices();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio", userId, token],
    queryFn: () => getPortfolio(userId, token!),
    enabled: !!userId && !!token,
    ...{ staleTime: 30000, refetchInterval: false },
  });

  if (isLoading) {
    return (
      <div className="bg-bg-secondary border border-border rounded-2xl p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-bg-tertiary animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const holdings = portfolio?.balances
    .map((balance) => {
      const tokenInfo = TOKEN_MAP[balance.tokenMint];
      if (!tokenInfo) return null;

      const amount = parseFloat(balance.amount) / Math.pow(10, tokenInfo.decimals);
      
      let price = 0;
      let value = 0;
      const priceData = prices[balance.tokenMint];
      
      if (balance.tokenMint === USDC.mint) {
        price = 1;
        value = amount;
      } else {
        price = priceData?.price || 0;
        value = amount * price;
      }

      const priceChange = priceData?.changePercent || 0;
      const isPositive = priceChange >= 0;

      return {
        ...balance,
        tokenInfo,
        amount,
        price,
        value,
        priceChange,
        isPositive,
      };
    })
    .filter((h): h is NonNullable<typeof h> => h !== null)
    .sort((a, b) => b.value - a.value) || [];

  if (holdings.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border rounded-2xl p-12 text-center">
        <p className="text-text-secondary mb-4">No holdings yet</p>
        <Button className="bg-accent-primary hover:bg-accent-light text-white" asChild>
          <Link href="/deposit">Make your first deposit</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-text-primary">Your Holdings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-sm font-semibold text-text-secondary">Asset</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-text-secondary">Price</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-text-secondary">Holdings</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-text-secondary">Value</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-text-secondary">P&L</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-text-secondary">Action</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr
                key={holding.tokenMint}
                className="border-b border-border hover:bg-bg-tertiary transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      holding.tokenInfo.category === "tokenized_stock"
                        ? "bg-accent-buy/20"
                        : "bg-accent-primary/20"
                    }`}>
                      <span className="text-sm font-bold text-accent-primary">
                        {holding.tokenInfo.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">{holding.tokenInfo.symbol}</div>
                      <div className="text-xs text-text-secondary">{holding.tokenInfo.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-mono text-text-primary">
                    ${holding.price > 0 ? holding.price.toFixed(2) : "—"}
                  </div>
                  <div className={`text-xs flex items-center justify-end gap-1 ${
                    holding.isPositive ? "text-accent-buy" : "text-accent-sell"
                  }`}>
                    {holding.isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(holding.priceChange).toFixed(2)}%
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-mono text-text-primary">
                    {holding.amount.toFixed(holding.tokenInfo.decimals > 6 ? 4 : 2)}
                  </div>
                  <div className="text-xs text-text-secondary">{holding.tokenInfo.symbol}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-mono font-semibold text-text-primary">
                    {formatCurrency(holding.value)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`font-mono font-semibold ${
                    holding.isPositive ? "text-accent-buy" : "text-accent-sell"
                  }`}>
                    {holding.isPositive ? "+" : ""}{formatCurrency(holding.value * (holding.priceChange / 100))}
                  </div>
                  <div className={`text-xs ${
                    holding.isPositive ? "text-accent-buy" : "text-accent-sell"
                  }`}>
                    {holding.isPositive ? "+" : ""}{holding.priceChange.toFixed(2)}%
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-accent-primary hover:bg-accent-light text-white text-xs px-3 py-1.5 h-auto"
                    asChild
                  >
                    <Link href={`/trade?symbol=${holding.tokenInfo.symbol}`}>Trade</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

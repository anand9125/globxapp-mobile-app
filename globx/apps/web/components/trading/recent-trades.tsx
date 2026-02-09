"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecentTrades } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { TOKEN_MAP, USDC } from "@/lib/tokens";
import { TrendingUp, TrendingDown } from "lucide-react";

interface RecentTradesProps {
  symbol: string;
  tokenMint: string;
}

export function RecentTrades({ symbol, tokenMint }: RecentTradesProps) {
  const { token } = useAuthToken();
  const tokenInfo = TOKEN_MAP[tokenMint];

  const { data: tradesData } = useQuery({
    queryKey: ["recentTrades", tokenMint],
    queryFn: () => getRecentTrades(token, { tokenMint, limit: 20 }),
    refetchInterval: 5000, // Poll every 5 seconds instead of 3
    staleTime: 3000, // Consider data stale after 3 seconds
  });

  const trades = tradesData?.trades || [];

  return (
    <div className="h-full flex flex-col bg-jupiter-bg">
      <div className="px-4 py-3 border-b border-jupiter-border bg-jupiter-surface">
        <h3 className="text-sm font-semibold text-jupiter-text-primary">Recent Trades</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <div className="grid grid-cols-3 gap-2 text-xs text-jupiter-text-tertiary mb-2">
            <div>Price</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Time</div>
          </div>
          {trades.length > 0 ? (
            trades.slice(0, 20).map((trade) => {
              if (!tokenInfo) return null;

              const inputAmount = parseFloat(trade.inputAmount) / Math.pow(10, trade.inputTokenMint === USDC.mint ? USDC.decimals : tokenInfo.decimals);
              const outputAmount = parseFloat(trade.outputAmount) / Math.pow(10, trade.outputTokenMint === USDC.mint ? USDC.decimals : tokenInfo.decimals);
              
              // Calculate price
              const price = trade.inputTokenMint === USDC.mint 
                ? outputAmount / inputAmount
                : inputAmount / outputAmount;

              const amount = trade.inputTokenMint === USDC.mint ? outputAmount : inputAmount;
              const side = trade.direction === "BUY" ? "buy" : "sell";
              const time = new Date(trade.executedAt || trade.createdAt);

              return (
                <div
                  key={trade.id}
                  className="grid grid-cols-3 gap-2 py-1 text-xs hover:bg-jupiter-surfaceHover rounded px-2 -mx-2"
                >
                  <div className={`font-mono flex items-center gap-1 ${side === "buy" ? "text-jupiter-success" : "text-jupiter-error"}`}>
                    {side === "buy" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    ${price.toFixed(2)}
                  </div>
                  <div className="text-right text-jupiter-text-secondary font-mono">{amount.toFixed(4)}</div>
                  <div className="text-right text-jupiter-text-tertiary">
                    {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-jupiter-text-tertiary text-xs py-4">No recent trades</div>
          )}
        </div>
      </div>
    </div>
  );
}

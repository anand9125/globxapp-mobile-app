"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getPortfolio, getTokenPrice } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { TOKEN_MAP, USDC, TOKENIZED_STOCKS } from "@/lib/tokens";
import { formatTokenAmount } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export function PortfolioSummary() {
  const { data: session } = useSession();
  const { token } = useAuthToken();
  const userId = session?.user?.id;
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);

  const { data: portfolio } = useQuery({
    queryKey: ["portfolio", userId, token],
    queryFn: () => getPortfolio(userId!, token!),
    enabled: !!userId && !!token,
    refetchInterval: 10000,
  });

  // Calculate total portfolio value
  useEffect(() => {
    if (!portfolio || !token) return;

    const calculateTotal = async () => {
      let total = 0;
      let previousTotal = 0;

      for (const balance of portfolio.balances) {
        const tokenInfo = TOKEN_MAP[balance.tokenMint];
        if (!tokenInfo) continue;

        const amount = parseFloat(balance.amount) / Math.pow(10, tokenInfo.decimals);

        if (balance.tokenMint === USDC.mint) {
          total += amount;
          previousTotal += amount;
        } else {
          try {
            const priceData = await getTokenPrice(token, {
              inputTokenMint: USDC.mint,
              outputTokenMint: balance.tokenMint,
            });
            total += amount * priceData.price;
            previousTotal += amount * (priceData.price * 0.95); // Mock previous price
          } catch (error) {
            console.error(`Failed to get price for ${balance.tokenMint}:`, error);
          }
        }
      }

      setTotalValue(total);
      setTotalChange(total - previousTotal);
    };

    calculateTotal();
  }, [portfolio, token]);

  const changePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  return (
    <div className="p-4 border-t border-jupiter-border bg-jupiter-surface">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-jupiter-text-primary mb-1">Portfolio</h3>
        <div className="text-2xl font-bold text-jupiter-text-primary">
          ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {totalChange !== 0 && (
          <div className={`flex items-center gap-1 text-sm mt-1 ${totalChange >= 0 ? "text-jupiter-success" : "text-jupiter-error"}`}>
            <TrendingUp className={`h-4 w-4 ${totalChange < 0 ? "rotate-180" : ""}`} />
            <span>
              {totalChange >= 0 ? "+" : ""}${totalChange.toFixed(2)} ({changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {portfolio?.balances.slice(0, 3).map((balance) => {
          const tokenInfo = TOKEN_MAP[balance.tokenMint];
          if (!tokenInfo) return null;

          const amount = formatTokenAmount(balance.amount, tokenInfo.decimals, "");
          const amountNum = parseFloat(amount);

          // For USDC, price is 1
          if (balance.tokenMint === USDC.mint) {
            return (
              <div key={balance.tokenMint} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold text-jupiter-text-primary">{tokenInfo.symbol}</div>
                  <div className="text-xs text-jupiter-text-tertiary">{amount} {tokenInfo.symbol}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-jupiter-text-primary">${amountNum.toFixed(2)}</div>
                  <div className="text-xs text-jupiter-text-tertiary">$1.00</div>
                </div>
              </div>
            );
          }

          // For other tokens, fetch price
          return (
            <TokenBalanceRow
              key={balance.tokenMint}
              tokenMint={balance.tokenMint}
              amount={amountNum}
              tokenInfo={tokenInfo}
              token={token || ""}
            />
          );
        })}
      </div>
    </div>
  );
}

function TokenBalanceRow({
  tokenMint,
  amount,
  tokenInfo,
  token,
}: {
  tokenMint: string;
  amount: number;
  tokenInfo: typeof TOKEN_MAP[string];
  token: string;
}) {
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchPrice = async () => {
      try {
        const priceData = await getTokenPrice(token, {
          inputTokenMint: USDC.mint,
          outputTokenMint: tokenMint,
        });
        setPrice(priceData.price);
      } catch (error) {
        console.error(`Failed to fetch price for ${tokenMint}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, [tokenMint, token]);

  const value = amount * price;

  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <div className="font-semibold text-jupiter-text-primary">{tokenInfo.symbol}</div>
        <div className="text-xs text-jupiter-text-tertiary">{amount.toFixed(4)} {tokenInfo.symbol}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-jupiter-text-primary">
          {loading ? "..." : `$${value.toFixed(2)}`}
        </div>
        <div className="text-xs text-jupiter-text-tertiary">
          {loading ? "..." : `$${price.toFixed(2)}`}
        </div>
      </div>
    </div>
  );
}

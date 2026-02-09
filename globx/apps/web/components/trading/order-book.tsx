"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecentTrades } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { TOKEN_MAP, USDC } from "@/lib/tokens";

interface OrderBookProps {
  symbol: string;
  tokenMint: string;
}

interface OrderLevel {
  price: number;
  amount: number;
  total: number;
}

export function OrderBook({ symbol, tokenMint }: OrderBookProps) {
  const { token } = useAuthToken();
  const tokenInfo = TOKEN_MAP[tokenMint];

  // Fetch recent trades to build order book
  const { data: tradesData } = useQuery({
    queryKey: ["recentTrades", tokenMint],
    queryFn: () => getRecentTrades(null, { tokenMint, limit: 100 }),
    refetchInterval: 20_000,
    staleTime: 10_000,
  });

  // Build order book from recent trades
  const buildOrderBook = (): { bids: OrderLevel[]; asks: OrderLevel[] } => {
    if (!tradesData?.trades || !tokenInfo) {
      return { bids: [], asks: [] };
    }

    const bidsMap = new Map<number, number>();
    const asksMap = new Map<number, number>();

    tradesData.trades.forEach((trade) => {
      const inputAmount = parseFloat(trade.inputAmount) / Math.pow(10, trade.inputTokenMint === USDC.mint ? USDC.decimals : tokenInfo.decimals);
      const outputAmount = parseFloat(trade.outputAmount) / Math.pow(10, trade.outputTokenMint === USDC.mint ? USDC.decimals : tokenInfo.decimals);
      
      // Calculate price
      const price = trade.inputTokenMint === USDC.mint 
        ? outputAmount / inputAmount // USDC -> Stock: price per stock
        : inputAmount / outputAmount; // Stock -> USDC: price per stock

      const amount = trade.inputTokenMint === USDC.mint ? outputAmount : inputAmount;
      const roundedPrice = Math.round(price * 100) / 100; // Round to 2 decimals

      if (trade.direction === "BUY") {
        bidsMap.set(roundedPrice, (bidsMap.get(roundedPrice) || 0) + amount);
      } else {
        asksMap.set(roundedPrice, (asksMap.get(roundedPrice) || 0) + amount);
      }
    });

    // Convert to arrays and sort
    const bids: OrderLevel[] = Array.from(bidsMap.entries())
      .map(([price, amount]) => ({ price, amount, total: 0 }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 10);
    
    const asks: OrderLevel[] = Array.from(asksMap.entries())
      .map(([price, amount]) => ({ price, amount, total: 0 }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 10);

    // Calculate cumulative totals
    let bidTotal = 0;
    bids.forEach((bid) => {
      bidTotal += bid.amount;
      bid.total = bidTotal;
    });

    let askTotal = 0;
    asks.forEach((ask) => {
      askTotal += ask.amount;
      ask.total = askTotal;
    });

    return { bids, asks };
  };

  const { bids, asks } = buildOrderBook();
  const spread = asks[0] && bids[0] ? asks[0].price - bids[0].price : 0;
  const midPrice = asks[0] && bids[0] ? (asks[0].price + bids[0].price) / 2 : 0;

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      <div className="px-4 py-3 border-b border-border bg-bg-tertiary">
        <h3 className="text-sm font-semibold text-text-primary">Order Book</h3>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <div className="grid grid-cols-3 gap-2 text-xs text-text-muted mb-2">
              <div className="text-right">Price</div>
              <div className="text-right">Amount</div>
              <div className="text-right">Total</div>
            </div>
            {asks.length > 0 ? (
              asks.map((ask, idx) => {
                const maxTotal = asks[asks.length - 1]?.total || 1;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-3 gap-2 py-1 text-xs hover:bg-bg-tertiary rounded px-2 -mx-2 relative group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 bg-accent-sell/20 rounded" style={{ width: `${(ask.total / maxTotal) * 100}%` }} />
                    <div className="text-right text-accent-sell font-mono relative z-10">${ask.price.toFixed(2)}</div>
                    <div className="text-right text-text-secondary font-mono relative z-10">{ask.amount.toFixed(4)}</div>
                    <div className="text-right text-text-muted font-mono relative z-10">{ask.total.toFixed(4)}</div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-text-muted text-xs py-4">No sell orders</div>
            )}
          </div>
        </div>

        <div className="px-4 py-2 border-y border-border bg-bg-tertiary">
          <div className="text-center">
            <div className="text-lg font-bold text-text-primary">
              ${midPrice > 0 ? midPrice.toFixed(2) : "0.00"}
            </div>
            <div className="text-xs text-text-muted">Spread: ${spread.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            {bids.length > 0 ? (
              bids.map((bid, idx) => {
                const maxTotal = bids[bids.length - 1]?.total || 1;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-3 gap-2 py-1 text-xs hover:bg-bg-tertiary rounded px-2 -mx-2 relative group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 bg-accent-buy/20 rounded" style={{ width: `${(bid.total / maxTotal) * 100}%` }} />
                    <div className="text-right text-accent-buy font-mono relative z-10">${bid.price.toFixed(2)}</div>
                    <div className="text-right text-text-secondary font-mono relative z-10">{bid.amount.toFixed(4)}</div>
                    <div className="text-right text-text-muted font-mono relative z-10">{bid.total.toFixed(4)}</div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-text-muted text-xs py-4">No buy orders</div>
            )}
            <div className="grid grid-cols-3 gap-2 text-xs text-text-muted mt-2 pt-2 border-t border-border">
              <div className="text-right">Price</div>
              <div className="text-right">Amount</div>
              <div className="text-right">Total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

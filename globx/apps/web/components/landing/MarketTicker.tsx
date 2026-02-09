"use client";

import { usePrices } from "@/contexts/price-context";
import { TOKENIZED_STOCKS, TOKEN_MAP } from "@/lib/tokens";
import { useEffect, useState } from "react";

export function MarketTicker() {
  const prices = usePrices();
  const [tickerItems, setTickerItems] = useState<Array<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  }>>([]);

  useEffect(() => {
    const items = TOKENIZED_STOCKS.map((stock) => {
      const priceData = prices[stock.mint];
      return {
        symbol: stock.symbol,
        price: priceData?.price || 0,
        change: priceData?.change || 0,
        changePercent: priceData?.changePercent || 0,
      };
    }).filter((item) => item.price > 0);

    setTickerItems(items);
  }, [prices]);

  if (tickerItems.length === 0) {
    return null;
  }

  return (
    <div className="relative border-y border-border bg-bg-secondary/50 backdrop-blur-sm overflow-hidden">
      <div className="flex animate-scroll">
        {/* Duplicate items for seamless loop */}
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 px-8 py-3 whitespace-nowrap"
          >
            <span className="font-semibold text-text-primary">{item.symbol}</span>
            <span className="font-mono text-text-primary">
              ${item.price.toFixed(2)}
            </span>
            <span
              className={`font-semibold ${
                item.change >= 0 ? "text-accent-buy" : "text-accent-sell"
              }`}
            >
              {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.changePercent).toFixed(2)}%
            </span>
            <span className="text-text-tertiary">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

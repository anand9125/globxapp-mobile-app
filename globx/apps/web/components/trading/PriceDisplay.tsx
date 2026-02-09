"use client";

import { usePrice } from "@/contexts/price-context";
import { TokenInfo } from "@/lib/tokens";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceDisplayProps {
  stock: TokenInfo;
}

export function PriceDisplay({ stock }: PriceDisplayProps) {
  const priceData = usePrice(stock.mint);

  if (!priceData || priceData.price === 0) {
    return (
      <div className="text-text-secondary">Loading price...</div>
    );
  }

  const isPositive = priceData.changePercent >= 0;

  return (
    <div className="flex items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold font-mono text-text-primary">{stock.symbol}</h1>
        <p className="text-sm text-text-secondary">{stock.name}</p>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold font-mono text-text-primary">
          ${priceData.price.toFixed(2)}
        </span>
        <div className={`flex items-center gap-1 font-semibold ${
          isPositive ? "text-accent-buy" : "text-accent-sell"
        }`}>
          {isPositive ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {priceData.change.toFixed(2)} ({isPositive ? "+" : ""}
            {priceData.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

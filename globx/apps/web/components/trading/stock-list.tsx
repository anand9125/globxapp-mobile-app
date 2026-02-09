"use client";

import { useEffect } from "react";
import { TOKENIZED_STOCKS, TOKEN_MAP, USDC } from "@/lib/tokens";
import { usePriceWebSocket } from "@/lib/use-price-websocket";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockListProps {
  selectedStock: string;
  onSelect: (mint: string) => void;
}

export function StockList({ selectedStock, onSelect }: StockListProps) {
  const tokenMints = TOKENIZED_STOCKS.map((s) => s.mint);
  
  const { prices } = usePriceWebSocket({
    tokens: tokenMints,
  });

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-jupiter-text-primary mb-2">Markets</h2>
        <div className="text-xs text-jupiter-text-tertiary">Tokenized Stocks</div>
      </div>

      <div className="space-y-1">
        {TOKENIZED_STOCKS.map((stock) => {
          const priceData = prices[stock.mint];
          const isSelected = selectedStock === stock.mint;

          // Default values if price not yet loaded
          const price = priceData?.price || 0;
          const change = priceData?.change || 0;
          const changePercent = priceData?.changePercent || 0;
          const isPositive = change >= 0;

          return (
            <button
              key={stock.mint}
              onClick={() => onSelect(stock.mint)}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                isSelected
                  ? "bg-jupiter-accent/20 border border-jupiter-accent"
                  : "hover:bg-jupiter-bg border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-jupiter-text-primary">{stock.symbol}</div>
                {price > 0 ? (
                  <div className={`text-sm font-semibold ${isPositive ? "text-jupiter-success" : "text-jupiter-error"}`}>
                    ${price.toFixed(2)}
                  </div>
                ) : (
                  <div className="text-sm text-jupiter-text-tertiary">Loading...</div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-jupiter-text-tertiary">{stock.name}</span>
                {price > 0 && (
                  <div className={`flex items-center gap-1 ${isPositive ? "text-jupiter-success" : "text-jupiter-error"}`}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {isPositive ? "+" : ""}
                      {changePercent.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

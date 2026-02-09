"use client";

import { useState } from "react";
import { usePrices } from "@/contexts/price-context";
import { TOKENIZED_STOCKS, TOKEN_MAP } from "@/lib/tokens";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StockSelectorProps {
  selectedStock: string;
  onSelect: (mint: string) => void;
}

export function StockSelector({ selectedStock, onSelect }: StockSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const prices = usePrices();

  const filteredStocks = TOKENIZED_STOCKS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-bg-secondary border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-bg-tertiary border-border h-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredStocks.map((stock) => {
            const priceData = prices[stock.mint];
            const price = priceData?.price || 0;
            const changePercent = priceData?.changePercent || 0;
            const isPositive = changePercent >= 0;
            const isSelected = stock.mint === selectedStock;

            return (
              <button
                key={stock.mint}
                onClick={() => onSelect(stock.mint)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  isSelected
                    ? "bg-accent-primary/20 border border-accent-primary/30"
                    : "hover:bg-bg-tertiary border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-text-primary">{stock.symbol}</div>
                  {price > 0 && (
                    <div className={`text-xs font-semibold flex items-center gap-1 ${
                      isPositive ? "text-accent-buy" : "text-accent-sell"
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(changePercent).toFixed(2)}%
                    </div>
                  )}
                </div>
                <div className="text-xs text-text-secondary mb-1">{stock.name}</div>
                {price > 0 && (
                  <div className="font-mono text-sm font-semibold text-text-primary">
                    ${price.toFixed(2)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

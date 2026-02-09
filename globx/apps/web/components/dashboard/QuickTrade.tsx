"use client";

import { useState } from "react";
import { usePrices } from "@/contexts/price-context";
import { TOKENIZED_STOCKS, TOKEN_MAP } from "@/lib/tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export function QuickTrade() {
  const [selectedToken, setSelectedToken] = useState(TOKENIZED_STOCKS[0]?.mint || "");
  const [amount, setAmount] = useState("");
  const prices = usePrices();

  const tokenInfo = TOKEN_MAP[selectedToken];
  const priceData = prices[selectedToken];
  const currentPrice = priceData?.price || 0;
  const estimatedTotal = amount ? parseFloat(amount) * currentPrice : 0;

  return (
    <div className="bg-bg-secondary border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Trade</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">
            Stock
          </label>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger className="bg-bg-tertiary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOKENIZED_STOCKS.map((stock) => (
                <SelectItem key={stock.mint} value={stock.mint}>
                  {stock.symbol} - {stock.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentPrice > 0 && (
          <div className="text-center py-2">
            <div className="text-2xl font-bold font-mono text-text-primary">
              ${currentPrice.toFixed(2)}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            className="flex-1 bg-accent-buy/20 hover:bg-accent-buy/30 text-accent-buy border border-accent-buy/30"
            variant="outline"
          >
            Buy
          </Button>
          <Button
            className="flex-1 bg-accent-sell/20 hover:bg-accent-sell/30 text-accent-sell border border-accent-sell/30"
            variant="outline"
          >
            Sell
          </Button>
        </div>

        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">
            Amount
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-bg-tertiary border-border font-mono"
          />
          <div className="flex gap-2 mt-2">
            {["25%", "50%", "75%", "MAX"].map((percent) => (
              <button
                key={percent}
                className="flex-1 px-3 py-1.5 text-xs bg-bg-tertiary hover:bg-bg-secondary rounded-lg text-text-secondary transition-colors"
              >
                {percent}
              </button>
            ))}
          </div>
        </div>

        {estimatedTotal > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Estimated Total</span>
              <span className="font-mono text-text-primary">${estimatedTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Button className="w-full bg-accent-primary hover:bg-accent-light text-white" asChild>
          <Link href={`/trade?symbol=${tokenInfo?.symbol || ""}`}>
            Trade {tokenInfo?.symbol || ""}
          </Link>
        </Button>
      </div>
    </div>
  );
}

"use client";

import { usePrices } from "@/contexts/price-context";
import { TOKENIZED_STOCKS } from "@/lib/tokens";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

export function PopularStocks() {
  const prices = usePrices();

  const stocks = TOKENIZED_STOCKS.slice(0, 6).map((stock) => {
    const priceData = prices[stock.mint];
    return {
      ...stock,
      price: priceData?.price || 0,
      change: priceData?.change || 0,
      changePercent: priceData?.changePercent || 0,
    };
  });

  return (
    <section className="relative py-32 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Trending Today
          </h2>
          <p className="text-lg text-text-secondary">
            Most actively traded tokenized stocks
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map((stock, i) => {
            const isPositive = stock.change >= 0;
            return (
              <motion.div
                key={stock.mint}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <Link
                  href={`/trade?symbol=${stock.symbol}`}
                  className="block bg-bg-secondary border border-border rounded-xl p-6 hover:bg-bg-tertiary hover:border-accent-primary/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,212,170,0.15)] group"
                >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-1">
                      {stock.symbol}
                    </h3>
                    <p className="text-sm text-text-secondary">{stock.name}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isPositive ? "bg-accent-buy/20" : "bg-accent-sell/20"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-6 w-6 text-accent-buy" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-accent-sell" />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold font-mono text-text-primary mb-1">
                    ${stock.price > 0 ? stock.price.toFixed(2) : "—"}
                  </div>
                  <div
                    className={`text-sm font-semibold flex items-center gap-1 ${
                      isPositive ? "text-accent-buy" : "text-accent-sell"
                    }`}
                  >
                    {isPositive ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)} (
                    {Math.abs(stock.changePercent).toFixed(2)}%)
                  </div>
                </div>

                <Button
                  className="w-full bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                  variant="outline"
                >
                  Trade
                </Button>
              </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { StockSelector } from "./StockSelector";
import { TradingChart } from "./trading-chart";
import { OrderBook } from "./order-book";
import { OrderForm } from "./OrderForm";
import { RecentTrades } from "./recent-trades";
import { PortfolioSummary } from "./portfolio-summary";
import { PriceDisplay } from "./PriceDisplay";
import { TOKENIZED_STOCKS, TOKEN_MAP } from "@/lib/tokens";
import { usePrice } from "@/contexts/price-context";

interface TradingTerminalProps {
  selectedStock: string;
  onStockSelect: (mint: string) => void;
}

export function TradingTerminal({ selectedStock, onStockSelect }: TradingTerminalProps) {
  const defaultStock = TOKENIZED_STOCKS[0];
  const stockInfo = (TOKEN_MAP[selectedStock] ?? defaultStock) ?? {
    mint: "",
    symbol: "—",
    name: "Unknown",
    decimals: 8,
    category: "tokenized_stock" as const,
  };
  const priceData = usePrice(selectedStock);
  const price = priceData?.price || 0;
  const high24h = priceData?.high24h || price * 1.02;
  const low24h = priceData?.low24h || price * 0.98;
  const volume24h = priceData?.volume24h || 0;

  return (
    <motion.div
      className="h-[calc(100vh-80px)] flex flex-col bg-bg-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Bar - Stock Info & Price */}
      <motion.div
        className="border-b border-border bg-bg-secondary/95 backdrop-blur-sm px-4 md:px-6 py-4"
        initial={{ y: -8 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <PriceDisplay stock={stockInfo} />
          <div className="flex items-center gap-4 md:gap-6 text-sm flex-wrap">
            <div>
              <span className="text-text-muted text-xs">24h High</span>
              <p className="text-text-primary font-semibold font-mono text-sm">${high24h.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-text-muted text-xs">24h Low</span>
              <p className="text-text-primary font-semibold font-mono text-sm">${low24h.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-text-muted text-xs">24h Volume</span>
              <p className="text-text-primary font-semibold font-mono text-sm">
                ${volume24h > 0 ? volume24h.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "0"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Trading Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <motion.div
          className="hidden lg:block w-64 overflow-y-auto border-r border-border bg-bg-secondary/50"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <StockSelector selectedStock={selectedStock} onSelect={onStockSelect} />
        </motion.div>

        <div className="flex-1 flex flex-col min-w-0">
          <motion.div
            className="flex-1 min-h-[300px] border-b border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            <TradingChart symbol={stockInfo.symbol} mint={selectedStock} />
          </motion.div>

          <div className="h-64 flex flex-col md:flex-row border-t border-border">
            <div className="flex-1 border-b md:border-b-0 md:border-r border-border">
              <OrderBook symbol={stockInfo.symbol} tokenMint={selectedStock} />
            </div>
            <div className="w-full md:w-80 border-t md:border-t-0 border-border">
              <RecentTrades symbol={stockInfo.symbol} tokenMint={selectedStock} />
            </div>
          </div>
        </div>

        <motion.div
          className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-border bg-bg-secondary/30"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="flex-1 overflow-y-auto">
            <OrderForm stock={stockInfo} currentPrice={price} />
          </div>
          <div className="border-t border-border">
            <PortfolioSummary />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

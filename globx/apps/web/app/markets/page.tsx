"use client";

import { useState, useMemo } from "react";
import { usePrices } from "@/contexts/price-context";
import { TOKENIZED_STOCKS } from "@/lib/tokens";
import { MainLayout } from "@/components/layout/main-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Star, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"price" | "change" | "volume">("change");
  const prices = usePrices();

  const categories = ["All", "Tech", "Finance", "Healthcare", "Energy", "Crypto"];

  const filteredStocks = useMemo(() => {
    let filtered = TOKENIZED_STOCKS.map((stock) => {
      const priceData = prices[stock.mint];
      return {
        ...stock,
        price: priceData?.price || 0,
        change: priceData?.change || 0,
        changePercent: priceData?.changePercent || 0,
        volume24h: 0, // Would come from backend
      };
    });

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category (mock for now)
    if (selectedCategory !== "All") {
      // In production, stocks would have category metadata
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return b.price - a.price;
        case "change":
          return b.changePercent - a.changePercent;
        case "volume":
          return b.volume24h - a.volume24h;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, prices]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">Markets</h1>
          <p className="text-text-secondary">Browse all available tokenized stocks</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <Input
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-bg-secondary border-border h-12"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 bg-bg-secondary border border-border rounded-xl text-text-primary"
            >
              <option value="change">24h Change</option>
              <option value="price">Price</option>
              <option value="volume">Volume</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-accent-primary text-white"
                  : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Market Table */}
        <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-text-secondary">★</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-text-secondary">Name</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-text-secondary">Price</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-text-secondary">24h Change</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-text-secondary">24h Volume</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-text-secondary">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock) => {
                  const isPositive = stock.changePercent >= 0;
                  return (
                    <tr
                      key={stock.mint}
                      className="border-b border-border hover:bg-bg-tertiary transition-colors group cursor-pointer"
                      onClick={() => window.location.href = `/trade?symbol=${stock.symbol}`}
                    >
                      <td className="px-6 py-4">
                        <button className="text-text-muted hover:text-accent-primary transition-colors">
                          <Star className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-buy/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-accent-buy">
                              {stock.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary">{stock.symbol}</div>
                            <div className="text-xs text-text-secondary">{stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-mono font-semibold text-text-primary">
                          ${stock.price > 0 ? stock.price.toFixed(2) : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`flex items-center justify-end gap-1 font-semibold ${
                          isPositive ? "text-accent-buy" : "text-accent-sell"
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {Math.abs(stock.changePercent).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-text-secondary font-mono text-sm">
                          ${formatCurrency(stock.volume24h)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-accent-primary hover:bg-accent-light text-white text-xs px-4 py-2 h-auto"
                          asChild
                        >
                          <Link href={`/trade?symbol=${stock.symbol}`}>Trade</Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

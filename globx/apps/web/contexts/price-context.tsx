"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useWebSocket } from "@/lib/use-websocket";
import { useQuery } from "@tanstack/react-query";
import { getTradeQuote } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { TOKENIZED_STOCKS, USDC } from "@/lib/tokens";

interface PriceUpdate {
  mint: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

interface PriceData extends PriceUpdate {
  volume24h: number;
  high24h: number;
  low24h: number;
}

interface PriceContextValue {
  prices: Record<string, PriceData>;
  getPrice: (mint: string) => PriceData | undefined;
  isConnected: boolean;
  error: Error | null;
}

const PriceContext = createContext<PriceContextValue | undefined>(undefined);

interface PriceProviderProps {
  children: React.ReactNode;
}

export function PriceProvider({ children }: PriceProviderProps) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const { token } = useAuthToken();

  // Initialize prices with default values
  useEffect(() => {
    const initialPrices: Record<string, PriceData> = {};
    TOKENIZED_STOCKS.forEach((token) => {
      initialPrices[token.mint] = {
        mint: token.mint,
        price: 0,
        change: 0,
        changePercent: 0,
        timestamp: Date.now(),
        volume24h: 0,
        high24h: 0,
        low24h: 0,
      };
    });
    setPrices(initialPrices);
  }, []);

  const handlePriceUpdate = useCallback((update: PriceUpdate) => {
    setPrices((prev) => {
      const existing = prev[update.mint];
      if (!existing) {
        return prev;
      }

      return {
        ...prev,
        [update.mint]: {
          ...update,
          volume24h: existing.volume24h,
          high24h: existing.high24h || update.price * 1.02,
          low24h: existing.low24h || update.price * 0.98,
        },
      };
    });
  }, []);

  // Try WebSocket first
  const { connected, error: wsError } = useWebSocket({
    channels: ["prices"],
    onPriceUpdate: handlePriceUpdate,
    enabled: true,
  });

  // One-time initial price fetch when we have token (so UI shows prices before WS or poll)
  const fetchPricesOnce = useCallback(async () => {
    if (!token) return;
    for (const stock of TOKENIZED_STOCKS) {
      try {
        const quote = await getTradeQuote(token, {
          inputTokenMint: USDC.mint,
          outputTokenMint: stock.mint,
          amount: Math.pow(10, USDC.decimals).toString(),
          slippageBps: 50,
        });
        const price = quote.outAmount / Math.pow(10, stock.decimals);
        setPrices((prev) => {
          const existing = prev[stock.mint];
          return {
            ...prev,
            [stock.mint]: {
              mint: stock.mint,
              price,
              change: existing?.change ?? 0,
              changePercent: existing?.changePercent ?? 0,
              timestamp: Date.now(),
              volume24h: existing?.volume24h ?? 0,
              high24h: existing?.high24h || price * 1.02,
              low24h: existing?.low24h || price * 0.98,
            },
          };
        });
        await new Promise((r) => setTimeout(r, 400));
      } catch {
        // ignore per-token errors
      }
    }
  }, [token]);

  // Initial fetch once when token becomes available
  useQuery({
    queryKey: ["price-initial", token],
    queryFn: async () => {
      await fetchPricesOnce();
      return null;
    },
    enabled: !!token && TOKENIZED_STOCKS.length > 0,
    staleTime: 60_000,
    refetchInterval: false,
  });

  // Fallback HTTP polling only when WebSocket is unavailable (less frequent)
  const shouldPoll = Boolean(!connected && wsError && wsError.message?.includes("unavailable"));
  const canPoll = Boolean(shouldPoll && !!token);

  useQuery({
    queryKey: ["price-poll", "fallback"],
    queryFn: async () => {
      if (!token) return null;
      for (const stock of TOKENIZED_STOCKS) {
        try {
          const quote = await getTradeQuote(token, {
            inputTokenMint: USDC.mint,
            outputTokenMint: stock.mint,
            amount: Math.pow(10, USDC.decimals).toString(),
            slippageBps: 50,
          });
          const price = quote.outAmount / Math.pow(10, stock.decimals);
          setPrices((prev) => {
            const existing = prev[stock.mint];
            const previousPrice = existing?.price || price;
            const change = price - previousPrice;
            const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
            return {
              ...prev,
              [stock.mint]: {
                mint: stock.mint,
                price,
                change,
                changePercent,
                timestamp: Date.now(),
                volume24h: existing?.volume24h ?? 0,
                high24h: existing?.high24h || price * 1.02,
                low24h: existing?.low24h || price * 0.98,
              },
            };
          });
          await new Promise((r) => setTimeout(r, 500));
        } catch {
          // ignore
        }
      }
      return null;
    },
    enabled: canPoll,
    refetchInterval: canPoll ? 60_000 : false,
    staleTime: 30_000,
  });

  const getPrice = useCallback(
    (mint: string): PriceData | undefined => {
      return prices[mint];
    },
    [prices]
  );

  return (
    <PriceContext.Provider
      value={{
        prices,
        getPrice,
        isConnected: connected,
        error: wsError,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
}

export function usePriceContext(): PriceContextValue {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error("usePriceContext must be used within a PriceProvider");
  }
  return context;
}

// Convenience hook for getting a single price
export function usePrice(mint: string): PriceData | undefined {
  const { getPrice } = usePriceContext();
  return getPrice(mint);
}

// Convenience hook for getting all prices
export function usePrices(): Record<string, PriceData> {
  const { prices } = usePriceContext();
  return prices;
}

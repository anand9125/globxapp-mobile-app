"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { USDC, TOKEN_MAP } from "@/lib/tokens";
import { getTradeQuote } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";

interface PriceUpdate {
  mint: string;
  price: number;
  change: number;
  changePercent: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

interface UsePriceWebSocketOptions {
  tokens: string[];
  onPriceUpdate?: (update: PriceUpdate) => void;
}

export function usePriceWebSocket({ tokens, onPriceUpdate }: UsePriceWebSocketOptions) {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});
  const [connected, setConnected] = useState(false);
  const pricePollingRef = useRef<NodeJS.Timeout | null>(null);
  const previousPricesRef = useRef<Record<string, number>>({});
  const backoffDelayRef = useRef<number>(20000); // Start with 20 seconds
  const rateLimitedRef = useRef<boolean>(false);
  const { token } = useAuthToken();

  // Poll prices via HTTP (using Jupiter quotes)
  const pollPrices = useCallback(async () => {
    if (!token) {
      setConnected(false);
      return;
    }
    
    // Skip if rate limited (will retry after backoff)
    if (rateLimitedRef.current) {
      return;
    }
    
    try {
      const updates: PriceUpdate[] = [];
      
      // Fetch prices sequentially to avoid rate limiting
      for (const tokenMint of tokens) {
        try {
          const tokenInfo = TOKEN_MAP[tokenMint];
          if (!tokenInfo) continue;

          // Get price by requesting a quote for 1 USDC
          const quote = await getTradeQuote(token, {
            inputTokenMint: USDC.mint,
            outputTokenMint: tokenMint,
            amount: Math.pow(10, USDC.decimals).toString(), // 1 USDC
            slippageBps: 50,
          });
          
          const price = quote.outAmount / Math.pow(10, tokenInfo.decimals);
          const previousPrice = previousPricesRef.current[tokenMint] || price;
          const change = price - previousPrice;
          const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
          
          // Store previous price
          previousPricesRef.current[tokenMint] = price;
          
          updates.push({
            mint: tokenMint,
            price,
            change,
            changePercent,
            volume24h: 0, // Would come from backend stats
            high24h: price * 1.02, // Would come from backend
            low24h: price * 0.98, // Would come from backend
            timestamp: Date.now(),
          });
          
          // Small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Reset backoff on successful request
          backoffDelayRef.current = 20000;
          rateLimitedRef.current = false;
        } catch (error: any) {
          // Check if it's a rate limit error
          if (error?.message?.includes("Too many quote requests") || 
              error?.message?.includes("QUOTE_RATE_LIMIT_EXCEEDED") ||
              error?.message?.includes("429")) {
            console.warn("Rate limit hit, backing off...");
            rateLimitedRef.current = true;
            // Exponential backoff: increase delay up to 60 seconds
            backoffDelayRef.current = Math.min(backoffDelayRef.current * 1.5, 60000);
            
            // Clear current interval and restart with backoff delay
            if (pricePollingRef.current) {
              clearInterval(pricePollingRef.current);
            }
            
            // Retry after backoff
            setTimeout(() => {
              rateLimitedRef.current = false;
              pollPrices();
              // Restart interval with increased delay
              pricePollingRef.current = setInterval(pollPrices, backoffDelayRef.current);
            }, backoffDelayRef.current);
            
            return; // Exit early on rate limit
          }
          
          console.error(`Failed to fetch price for ${tokenMint}:`, error);
        }
      }
      
      if (updates.length > 0) {
        setPrices((prev) => {
          const updated = { ...prev };
          updates.forEach((update) => {
            updated[update.mint] = update;
            onPriceUpdate?.(update);
          });
          return updated;
        });
        setConnected(true);
      }
    } catch (error: any) {
      // Handle general errors
      if (error?.message?.includes("Too many quote requests") || 
          error?.message?.includes("QUOTE_RATE_LIMIT_EXCEEDED")) {
        rateLimitedRef.current = true;
        backoffDelayRef.current = Math.min(backoffDelayRef.current * 1.5, 60000);
      }
      console.error("Error polling prices:", error);
      setConnected(false);
    }
  }, [tokens, token, onPriceUpdate]);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      return;
    }
    
    // Start polling prices every 30 seconds (to stay under rate limit)
    // With 6 tokens and 2 components, that's ~24 requests per minute (under 60 limit)
    const pollingInterval = Math.max(backoffDelayRef.current, 30000);
    
    // Add random delay (0-5 seconds) to stagger requests between components
    const randomDelay = Math.floor(Math.random() * 5000);
    
    // Initial fetch after a short delay + random offset
    const initialTimeout = setTimeout(pollPrices, 1000 + randomDelay);
    
    // Start interval after initial fetch
    const intervalTimeout = setTimeout(() => {
      pricePollingRef.current = setInterval(pollPrices, pollingInterval);
    }, 1000 + randomDelay);
    
    return () => {
      if (pricePollingRef.current) {
        clearInterval(pricePollingRef.current);
      }
      clearTimeout(initialTimeout);
      clearTimeout(intervalTimeout);
    };
  }, [pollPrices, token]);

  return { prices, connected };
}

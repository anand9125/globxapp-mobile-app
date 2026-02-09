// React Query configuration with optimal stale times and cache settings
// Designed to minimize API calls while keeping data fresh

import { QueryClient } from "@tanstack/react-query";

export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Default stale time: 30 seconds
      staleTime: 30 * 1000,
      // Cache time: 5 minutes
      gcTime: 5 * 60 * 1000,
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Retry failed requests
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
};

// Query-specific configurations
export const queryConfigs = {
  // Portfolio data (user-specific, less frequent updates)
  portfolio: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // WebSocket updates instead
  },

  // Recent trades (public, more frequent)
  recentTrades: {
    staleTime: 5 * 1000, // 5 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false, // WebSocket updates instead
  },

  // Quotes (expensive, cache aggressively)
  quote: {
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 30 * 1000, // 30 seconds
    refetchInterval: false as const, // Only on user input
  },

  // Order book (real-time via WebSocket)
  orderBook: {
    staleTime: 3 * 1000, // 3 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: false, // WebSocket updates instead
  },

  // Static data (tokens, markets list)
  static: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: false,
  },
};

"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { getTradeQuote } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { queryConfigs } from "@/lib/react-query-config";

interface UseTradeQuoteParams {
  inputTokenMint: string;
  outputTokenMint: string;
  amount: string;
  slippageBps?: number;
  enabled?: boolean;
}

/**
 * Debounced quote hook - only fetches quote when user stops typing
 * Prevents excessive API calls during input
 */
export function useTradeQuote(params: UseTradeQuoteParams) {
  const { token } = useAuthToken();
  const { inputTokenMint, outputTokenMint, amount, slippageBps = 50, enabled = true } = params;

  // Debounce amount input by 800ms
  const [debouncedAmount] = useDebounce(amount, 800);

  return useQuery({
    queryKey: ["quote", inputTokenMint, outputTokenMint, debouncedAmount, slippageBps],
    queryFn: () => {
      if (!token) throw new Error("Not authenticated");
      return getTradeQuote(token, {
        inputTokenMint,
        outputTokenMint,
        amount: debouncedAmount,
        slippageBps,
      });
    },
    enabled:
      enabled &&
      !!token &&
      !!debouncedAmount &&
      parseFloat(debouncedAmount) > 0 &&
      !!inputTokenMint &&
      !!outputTokenMint,
    ...queryConfigs.quote,
    // Don't retry quote requests (they're expensive)
    retry: false,
  });
}

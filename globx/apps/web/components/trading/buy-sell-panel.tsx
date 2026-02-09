"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { executeTrade, getTradeQuote, getPortfolio } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { TokenInfo, USDC, TOKEN_MAP } from "@/lib/tokens";
import { Loader2, TrendingUp, TrendingDown, CheckCircle2, XCircle } from "lucide-react";
import { formatTokenAmount } from "@/lib/utils";

interface BuySellPanelProps {
  stock: TokenInfo;
  currentPrice: number;
}

export function BuySellPanel({ stock, currentPrice }: BuySellPanelProps) {
  const { data: session } = useSession();
  const { token } = useAuthToken();
  const queryClient = useQueryClient();
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [percentage, setPercentage] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userId = session?.user?.id;

  // Fetch portfolio for available balance
  const { data: portfolio } = useQuery({
    queryKey: ["portfolio", userId, token],
    queryFn: () => getPortfolio(userId!, token!),
    enabled: !!userId && !!token,
  });

  // Get available balance
  const availableBalance = portfolio?.balances.find(
    (b) => b.tokenMint === (side === "buy" ? USDC.mint : stock.mint)
  );
  const balanceAmount = availableBalance
    ? parseFloat(availableBalance.amount) / Math.pow(10, side === "buy" ? USDC.decimals : stock.decimals)
    : 0;

  // Fetch quote for market orders
  const { data: quote, isLoading: quoteLoading } = useQuery({
    queryKey: ["quote", side === "buy" ? USDC.mint : stock.mint, side === "buy" ? stock.mint : USDC.mint, amount, token],
    queryFn: () => {
      if (!amount || parseFloat(amount) <= 0 || !token) return null;
      const inputTokenMint = side === "buy" ? USDC.mint : stock.mint;
      const outputTokenMint = side === "buy" ? stock.mint : USDC.mint;
      const inputAmount = parseFloat(amount) * Math.pow(10, side === "buy" ? USDC.decimals : stock.decimals);
      
      return getTradeQuote(token, {
        inputTokenMint,
        outputTokenMint,
        amount: inputAmount.toString(),
        slippageBps: 100,
      });
    },
    enabled: !!amount && parseFloat(amount) > 0 && !!token && orderType === "market",
    refetchInterval: 5000,
  });

  const executeMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !token) throw new Error("Not authenticated");
      if (!amount || parseFloat(amount) <= 0) throw new Error("Invalid amount");

      const inputTokenMint = side === "buy" ? USDC.mint : stock.mint;
      const outputTokenMint = side === "buy" ? stock.mint : USDC.mint;
      const inputAmount = (parseFloat(amount) * Math.pow(10, side === "buy" ? USDC.decimals : stock.decimals)).toString();

      return executeTrade(token, {
        direction: side === "buy" ? "BUY" : "SELL",
        inputTokenMint,
        inputAmount,
        outputTokenMint,
        slippageBps: 100,
        routeType: "jupiter",
      });
    },
    onSuccess: () => {
      setAmount("");
      setLimitPrice("");
      setPercentage(null);
      setShowSuccess(true);
      setErrorMessage(null);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["portfolio", userId] });
      queryClient.invalidateQueries({ queryKey: ["recentTrades"] });
      queryClient.invalidateQueries({ queryKey: ["userTrades", userId] });
      
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Trade execution failed");
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const handlePercentageClick = (pct: number) => {
    setPercentage(pct);
    const available = balanceAmount;
    setAmount((available * pct / 100).toFixed(4));
  };

  // Calculate totals
  const executionPrice = orderType === "market" && quote
    ? quote.outAmount / Math.pow(10, side === "buy" ? stock.decimals : USDC.decimals) / parseFloat(amount)
    : parseFloat(limitPrice) || currentPrice;

  const totalCost = amount && parseFloat(amount) > 0 
    ? orderType === "market" && quote
      ? (parseFloat(amount) * executionPrice).toFixed(2)
      : (parseFloat(amount) * parseFloat(limitPrice || currentPrice.toString())).toFixed(2)
    : "0.00";

  const outputAmount = orderType === "market" && quote
    ? quote.outAmount / Math.pow(10, side === "buy" ? stock.decimals : USDC.decimals)
    : parseFloat(amount) * (side === "buy" ? parseFloat(limitPrice || currentPrice.toString()) : 1 / parseFloat(limitPrice || currentPrice.toString()));

  return (
    <div className="h-full flex flex-col bg-jupiter-surface">
      <div className="p-4 border-b border-jupiter-border">
        <Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-jupiter-bg">
            <TabsTrigger
              value="buy"
              className="data-[state=active]:bg-jupiter-success data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="data-[state=active]:bg-jupiter-error data-[state=active]:text-white"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="p-3 bg-jupiter-success/20 border border-jupiter-success/30 rounded-lg flex items-center gap-2 text-sm text-jupiter-success">
            <CheckCircle2 className="h-5 w-5" />
            <span>Trade submitted successfully!</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-jupiter-error/20 border border-jupiter-error/30 rounded-lg flex items-center gap-2 text-sm text-jupiter-error">
            <XCircle className="h-5 w-5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Order Type */}
        <div>
          <Label className="text-sm text-jupiter-text-secondary mb-2 block">Order Type</Label>
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType("market")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                orderType === "market"
                  ? "bg-jupiter-accent text-white"
                  : "bg-jupiter-bg text-jupiter-text-secondary hover:bg-jupiter-surfaceHover"
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                orderType === "limit"
                  ? "bg-jupiter-accent text-white"
                  : "bg-jupiter-bg text-jupiter-text-secondary hover:bg-jupiter-surfaceHover"
              }`}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Limit Price (if limit order) */}
        {orderType === "limit" && (
          <div>
            <Label className="text-sm text-jupiter-text-secondary mb-2 block">Limit Price (USDC)</Label>
            <Input
              type="number"
              placeholder={currentPrice > 0 ? currentPrice.toFixed(2) : "0.00"}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="jupiter-input border-jupiter-border"
            />
          </div>
        )}

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-jupiter-text-secondary">Amount ({side === "buy" ? stock.symbol : "USDC"})</Label>
            <span className="text-xs text-jupiter-text-tertiary">
              Available: {balanceAmount.toFixed(2)} {side === "buy" ? "USDC" : stock.symbol}
            </span>
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setPercentage(null);
            }}
            className="jupiter-input border-jupiter-border text-lg font-semibold"
          />
          <div className="flex gap-2 mt-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePercentageClick(pct)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  percentage === pct
                    ? "bg-jupiter-accent text-white"
                    : "bg-jupiter-bg text-jupiter-text-secondary hover:bg-jupiter-surfaceHover"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="jupiter-card bg-jupiter-bg border-jupiter-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-jupiter-text-secondary">Price</span>
            <span className="text-jupiter-text-primary font-semibold">
              {quoteLoading ? (
                <span className="text-jupiter-text-tertiary">Loading...</span>
              ) : (
                `$${executionPrice.toFixed(2)}`
              )}
            </span>
          </div>
          {orderType === "market" && (
            <div className="flex justify-between text-sm">
              <span className="text-jupiter-text-secondary">You'll {side === "buy" ? "Receive" : "Get"}</span>
              <span className="text-jupiter-text-primary font-semibold">
                {quoteLoading ? (
                  <span className="text-jupiter-text-tertiary">Loading...</span>
                ) : (
                  `${outputAmount.toFixed(4)} ${side === "buy" ? stock.symbol : "USDC"}`
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-jupiter-text-secondary">Total</span>
            <span className="text-jupiter-text-primary font-semibold">${totalCost}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-jupiter-text-secondary">Fee (0.5%)</span>
            <span className="text-jupiter-text-primary font-semibold">
              ${(parseFloat(totalCost) * 0.005).toFixed(2)}
            </span>
          </div>
          <div className="border-t border-jupiter-border pt-2 flex justify-between">
            <span className="text-sm font-semibold text-jupiter-text-primary">You'll {side === "buy" ? "Pay" : "Receive"}</span>
            <span className="text-sm font-bold text-jupiter-text-primary">
              ${(parseFloat(totalCost) * (side === "buy" ? 1.005 : 0.995)).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Execute Button */}
        <Button
          onClick={() => executeMutation.mutate()}
          disabled={
            !amount || 
            parseFloat(amount) <= 0 || 
            executeMutation.isPending || 
            (orderType === "limit" && !limitPrice) ||
            parseFloat(amount) > balanceAmount
          }
          className={`w-full h-12 text-lg font-semibold ${
            side === "buy"
              ? "bg-jupiter-success hover:bg-jupiter-success/90 text-white"
              : "bg-jupiter-error hover:bg-jupiter-error/90 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {executeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `${side === "buy" ? "Buy" : "Sell"} ${stock.symbol}`
          )}
        </Button>
      </div>
    </div>
  );
}

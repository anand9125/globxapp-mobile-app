"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { executeTrade, getPortfolio } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { useTradeQuote } from "@/lib/hooks/use-quote";
import { TokenInfo, USDC, TOKEN_MAP } from "@/lib/tokens";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { formatCurrency, formatTokenAmount } from "@/lib/utils";

interface OrderFormProps {
  stock: TokenInfo;
  currentPrice: number;
}

export function OrderForm({ stock, currentPrice }: OrderFormProps) {
  const { data: session } = useSession();
  const { token } = useAuthToken();
  const queryClient = useQueryClient();
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [amountType, setAmountType] = useState<"shares" | "usd">("shares");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userId = session?.user?.id;

  // Fetch portfolio for available balance
  const { data: portfolio } = useQuery({
    queryKey: ["portfolio", userId, token],
    queryFn: () => getPortfolio(userId!, token!),
    enabled: !!userId && !!token,
    ...{ staleTime: 30000, refetchInterval: false },
  });

  // Get available balance
  const availableBalance = portfolio?.balances.find(
    (b) => b.tokenMint === (side === "buy" ? USDC.mint : stock.mint)
  );
  const balanceAmount = availableBalance
    ? parseFloat(availableBalance.amount) / Math.pow(10, side === "buy" ? USDC.decimals : stock.decimals)
    : 0;

  // Calculate input amount for quote
  const inputAmountForQuote = amount
    ? amountType === "shares"
      ? (parseFloat(amount) * Math.pow(10, stock.decimals)).toString()
      : (parseFloat(amount) * Math.pow(10, USDC.decimals)).toString()
    : "";

  // Fetch quote using debounced hook (only for market orders)
  const { data: quote, isLoading: quoteLoading } = useTradeQuote({
    inputTokenMint: side === "buy" ? USDC.mint : stock.mint,
    outputTokenMint: side === "buy" ? stock.mint : USDC.mint,
    amount: inputAmountForQuote,
    slippageBps: 100,
    enabled: orderType === "market" && !!amount && parseFloat(amount) > 0,
  });

  const executeMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !token) throw new Error("Not authenticated");
      if (!amount || parseFloat(amount) <= 0) throw new Error("Invalid amount");

      const inputTokenMint = side === "buy" ? USDC.mint : stock.mint;
      const outputTokenMint = side === "buy" ? stock.mint : USDC.mint;
      
      let inputAmount: string;
      if (amountType === "shares") {
        inputAmount = side === "buy"
          ? (parseFloat(amount) * currentPrice * Math.pow(10, USDC.decimals)).toString()
          : (parseFloat(amount) * Math.pow(10, stock.decimals)).toString();
      } else {
        inputAmount = side === "buy"
          ? (parseFloat(amount) * Math.pow(10, USDC.decimals)).toString()
          : (parseFloat(amount) / currentPrice * Math.pow(10, stock.decimals)).toString();
      }

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
      setShowSuccess(true);
      setErrorMessage(null);
      
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

  type QuoteData = { inAmount: number; outAmount: number; priceImpactPct?: string };
  const q = quote as QuoteData | undefined;

  const estimatedShares = q && side === "buy"
    ? q.outAmount / Math.pow(10, stock.decimals)
    : amountType === "shares"
    ? parseFloat(amount) || 0
    : (parseFloat(amount) || 0) / currentPrice;

  const estimatedTotal = q && side === "buy"
    ? q.inAmount / Math.pow(10, USDC.decimals)
    : amountType === "shares"
    ? (parseFloat(amount) || 0) * currentPrice
    : parseFloat(amount) || 0;

  const estimatedReceived = q && side === "sell"
    ? q.outAmount / Math.pow(10, USDC.decimals)
    : amountType === "shares"
    ? (parseFloat(amount) || 0) * currentPrice
    : parseFloat(amount) || 0;

  const fee = estimatedTotal * 0.005; // 0.5% fee
  const priceImpact = q?.priceImpactPct ? parseFloat(q.priceImpactPct) : 0;

  const handlePercentageClick = (percent: number) => {
    const maxAmount = balanceAmount;
    const targetAmount = (maxAmount * percent) / 100;
    if (side === "buy") {
      setAmountType("usd");
      setAmount(targetAmount.toFixed(2));
    } else {
      setAmountType("shares");
      setAmount(targetAmount.toFixed(4));
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-secondary border-l border-border">
      {/* Buy/Sell Tabs */}
      <Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 rounded-none border-b border-border bg-bg-secondary">
          <TabsTrigger
            value="buy"
            className="data-[state=active]:bg-accent-buy/20 data-[state=active]:text-accent-buy rounded-none"
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="data-[state=active]:bg-accent-sell/20 data-[state=active]:text-accent-sell rounded-none"
          >
            Sell
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="flex-1 flex flex-col m-0 p-6 space-y-4">
          {/* Order Type */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Order Type
            </label>
            <Select value={orderType} onValueChange={(v) => setOrderType(v as "market" | "limit")}>
              <SelectTrigger className="bg-bg-tertiary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limit Price (for limit orders) */}
          {orderType === "limit" && (
            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                Limit Price
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="bg-bg-tertiary border-border font-mono"
              />
            </div>
          )}

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary">Amount</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setAmountType("shares")}
                  className={`px-2 py-1 text-xs rounded ${
                    amountType === "shares"
                      ? "bg-accent-primary/20 text-accent-primary"
                      : "bg-bg-tertiary text-text-secondary"
                  }`}
                >
                  Shares
                </button>
                <button
                  onClick={() => setAmountType("usd")}
                  className={`px-2 py-1 text-xs rounded ${
                    amountType === "usd"
                      ? "bg-accent-primary/20 text-accent-primary"
                      : "bg-bg-tertiary text-text-secondary"
                  }`}
                >
                  USD
                </button>
              </div>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-bg-tertiary border-border font-mono text-lg h-14"
            />
            <div className="flex gap-2 mt-2">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => handlePercentageClick(percent)}
                  className="flex-1 px-3 py-1.5 text-xs bg-bg-tertiary hover:bg-bg-secondary rounded-lg text-text-secondary transition-colors"
                >
                  {percent}%
                </button>
              ))}
            </div>
            <div className="text-xs text-text-muted mt-1">
              Available: {formatCurrency(balanceAmount)} USDC
            </div>
          </div>

          {/* Quote Summary */}
          {quoteLoading && (
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Fetching quote...</span>
            </div>
          )}

          {!!q && !quoteLoading && (
            <div className="space-y-2 p-4 bg-bg-tertiary rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Estimated Shares</span>
                <span className="font-mono text-text-primary">{estimatedShares.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Estimated Total</span>
                <span className="font-mono text-text-primary">{formatCurrency(estimatedTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Fee (0.5%)</span>
                <span className="font-mono text-text-secondary">{formatCurrency(fee)}</span>
              </div>
              {priceImpact > 1 && (
                <div className="flex items-center gap-2 text-xs text-accent-sell">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Price impact: {priceImpact.toFixed(2)}%</span>
                </div>
              )}
            </div>
          )}

          {/* Success/Error Messages */}
          {showSuccess && (
            <div className="p-3 bg-accent-buy/10 border border-accent-buy/30 rounded-xl flex items-center gap-2 text-accent-buy text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Order placed successfully!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-accent-sell/10 border border-accent-sell/30 rounded-xl flex items-center gap-2 text-accent-sell text-sm">
              <XCircle className="h-5 w-5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Execute Button */}
          <Button
            onClick={() => executeMutation.mutate()}
            disabled={!amount || parseFloat(amount) <= 0 || executeMutation.isPending || quoteLoading}
            className={`w-full h-12 rounded-xl font-semibold ${
              side === "buy"
                ? "bg-accent-buy hover:bg-accent-buy/90 text-white"
                : "bg-accent-sell hover:bg-accent-sell/90 text-white"
            }`}
          >
            {executeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Executing...
              </>
            ) : (
              `Buy ${stock.symbol}`
            )}
          </Button>
        </TabsContent>

        <TabsContent value="sell" className="flex-1 flex flex-col m-0 p-6 space-y-4">
          {/* Similar structure for Sell tab */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Order Type
            </label>
            <Select value={orderType} onValueChange={(v) => setOrderType(v as "market" | "limit")}>
              <SelectTrigger className="bg-bg-tertiary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orderType === "limit" && (
            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                Limit Price
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="bg-bg-tertiary border-border font-mono"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary">Amount</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setAmountType("shares")}
                  className={`px-2 py-1 text-xs rounded ${
                    amountType === "shares"
                      ? "bg-accent-primary/20 text-accent-primary"
                      : "bg-bg-tertiary text-text-secondary"
                  }`}
                >
                  Shares
                </button>
                <button
                  onClick={() => setAmountType("usd")}
                  className={`px-2 py-1 text-xs rounded ${
                    amountType === "usd"
                      ? "bg-accent-primary/20 text-accent-primary"
                      : "bg-bg-tertiary text-text-secondary"
                  }`}
                >
                  USD
                </button>
              </div>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-bg-tertiary border-border font-mono text-lg h-14"
            />
            <div className="flex gap-2 mt-2">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => handlePercentageClick(percent)}
                  className="flex-1 px-3 py-1.5 text-xs bg-bg-tertiary hover:bg-bg-secondary rounded-lg text-text-secondary transition-colors"
                >
                  {percent}%
                </button>
              ))}
            </div>
            <div className="text-xs text-text-muted mt-1">
              Available: {balanceAmount.toFixed(4)} {stock.symbol}
            </div>
          </div>

          {quoteLoading && (
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Fetching quote...</span>
            </div>
          )}

          {!!q && !quoteLoading && (
            <div className="space-y-2 p-4 bg-bg-tertiary rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">You'll Receive</span>
                <span className="font-mono text-text-primary">{formatCurrency(estimatedReceived)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Fee (0.5%)</span>
                <span className="font-mono text-text-secondary">{formatCurrency(fee)}</span>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="p-3 bg-accent-buy/10 border border-accent-buy/30 rounded-xl flex items-center gap-2 text-accent-buy text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Order placed successfully!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-accent-sell/10 border border-accent-sell/30 rounded-xl flex items-center gap-2 text-accent-sell text-sm">
              <XCircle className="h-5 w-5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button
            onClick={() => executeMutation.mutate()}
            disabled={!amount || parseFloat(amount) <= 0 || executeMutation.isPending || quoteLoading}
            className="w-full h-12 rounded-xl font-semibold bg-accent-sell hover:bg-accent-sell/90 text-white"
          >
            {executeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Executing...
              </>
            ) : (
              `Sell ${stock.symbol}`
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

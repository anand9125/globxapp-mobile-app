import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import {
  getPortfolio,
  getTradeQuote,
  executeTrade,
  getRecentTrades,
} from "../lib/api";
import { colors, spacing, borderRadius } from "../lib/theme";
import { formatCurrency } from "../lib/utils";
import { TOKENIZED_STOCKS, USDC, type TokenInfo } from "../lib/tokens";

const SLIPPAGE_BPS = 100;

export function TradeScreen() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStock, setSelectedStock] = useState<TokenInfo>(TOKENIZED_STOCKS[0]);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amountType, setAmountType] = useState<"shares" | "usd">("usd");
  const [amount, setAmount] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const inputAmountForQuote =
    amountNum > 0
      ? side === "buy"
        ? amountType === "usd"
          ? String(Math.round(amountNum * 1e6))
          : String(Math.round(amountNum * Math.pow(10, selectedStock.decimals)))
        : amountType === "usd"
        ? String(Math.round((amountNum / (currentPrice || 1)) * Math.pow(10, selectedStock.decimals)))
        : String(Math.round(amountNum * Math.pow(10, selectedStock.decimals)))
      : "";

  const { data: portfolio } = useQuery({
    queryKey: ["portfolio", user?.id, token],
    queryFn: () => getPortfolio(user!.id, token!),
    enabled: !!user?.id && !!token,
  });

  const { data: quoteData, isLoading: quoteLoading } = useQuery({
    queryKey: [
      "quote",
      side,
      selectedStock.mint,
      inputAmountForQuote,
      SLIPPAGE_BPS,
      token,
    ],
    queryFn: () =>
      getTradeQuote(token!, {
        inputTokenMint: side === "buy" ? USDC.mint : selectedStock.mint,
        outputTokenMint: side === "buy" ? selectedStock.mint : USDC.mint,
        amount: inputAmountForQuote,
        slippageBps: SLIPPAGE_BPS,
      }),
    enabled:
      !!token &&
      !!inputAmountForQuote &&
      amountNum > 0,
    staleTime: 15000,
    retry: false,
  });

  const currentPrice =
    quoteData && amountNum > 0
      ? side === "buy"
        ? quoteData.inAmount / Math.pow(10, USDC.decimals) / (quoteData.outAmount / Math.pow(10, selectedStock.decimals))
        : quoteData.outAmount / Math.pow(10, USDC.decimals) / (quoteData.inAmount / Math.pow(10, selectedStock.decimals))
      : null;

  const { data: priceQuote } = useQuery({
    queryKey: ["price", selectedStock.mint, token],
    queryFn: () =>
      getTradeQuote(token!, {
        inputTokenMint: USDC.mint,
        outputTokenMint: selectedStock.mint,
        amount: String(1e6),
        slippageBps: 50,
      }),
    enabled: !!token && !!selectedStock?.mint,
    staleTime: 60000,
  });

  const displayPrice =
    priceQuote != null
      ? (1e6 / (priceQuote.outAmount / Math.pow(10, selectedStock.decimals)))
      : null;

  const balanceForSide = portfolio?.balances.find((b) =>
    side === "buy" ? b.tokenMint === USDC.mint : b.tokenMint === selectedStock.mint
  );
  const balanceAmount = balanceForSide
    ? parseFloat(balanceForSide.amount) /
      Math.pow(10, side === "buy" ? USDC.decimals : selectedStock.decimals)
    : 0;

  const executeMutation = useMutation({
    mutationFn: async () => {
      if (!token || !amountNum || amountNum <= 0) throw new Error("Invalid amount");
      const inputMint = side === "buy" ? USDC.mint : selectedStock.mint;
      const outputMint = side === "buy" ? selectedStock.mint : USDC.mint;
      let inputAmount: string;
      if (side === "buy") {
        inputAmount =
          amountType === "usd"
            ? String(Math.round(amountNum * 1e6))
            : String(Math.round(amountNum * (displayPrice ?? 0) * 1e6));
      } else {
        const shares = amountType === "shares" ? amountNum : amountNum / (displayPrice ?? 1);
        inputAmount = String(Math.round(shares * Math.pow(10, selectedStock.decimals)));
      }
      return executeTrade(token, {
        direction: side === "buy" ? "BUY" : "SELL",
        inputTokenMint: inputMint,
        inputAmount,
        outputTokenMint: outputMint,
        slippageBps: SLIPPAGE_BPS,
        routeType: "jupiter",
      });
    },
    onSuccess: () => {
      setAmount("");
      setSuccessMsg("Order placed successfully!");
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["recentTrades"] });
      queryClient.invalidateQueries({ queryKey: ["ledger", user?.id] });
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Trade failed");
      setTimeout(() => setErrorMsg(null), 5000);
    },
  });

  const { data: recentTrades } = useQuery({
    queryKey: ["recentTrades", selectedStock.mint],
    queryFn: () => getRecentTrades(null, { tokenMint: selectedStock.mint, limit: 15 }),
    enabled: !!selectedStock?.mint,
  });

  const estimatedShares =
    side === "buy" && quoteData
      ? quoteData.outAmount / Math.pow(10, selectedStock.decimals)
      : amountType === "shares"
      ? amountNum
      : displayPrice
      ? amountNum / displayPrice
      : 0;
  const estimatedTotal =
    side === "buy"
      ? amountType === "usd"
        ? amountNum
        : amountNum * (displayPrice ?? 0)
      : quoteData
      ? quoteData.outAmount / Math.pow(10, USDC.decimals)
      : amountNum * (displayPrice ?? 0);

  const setPercent = (pct: number) => {
    const val = (balanceAmount * pct) / 100;
    if (side === "buy") {
      setAmountType("usd");
      setAmount(val.toFixed(2));
    } else {
      setAmountType("shares");
      setAmount(val.toFixed(4));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Trade</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stockList}
          contentContainerStyle={styles.stockListContent}
        >
          {TOKENIZED_STOCKS.map((stock) => (
            <TouchableOpacity
              key={stock.mint}
              style={[
                styles.stockChip,
                selectedStock.mint === stock.mint && styles.stockChipActive,
              ]}
              onPress={() => setSelectedStock(stock)}
            >
              <Text
                style={[
                  styles.stockChipText,
                  selectedStock.mint === stock.mint && styles.stockChipTextActive,
                ]}
              >
                {stock.symbol}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>{selectedStock.name}</Text>
          {displayPrice != null ? (
            <Text style={styles.priceValue}>{formatCurrency(displayPrice)}</Text>
          ) : (
            <ActivityIndicator size="small" color={colors.accent.primary} />
          )}
        </View>

        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>Price chart</Text>
          <Text style={styles.chartPlaceholderSubtext}>
            {selectedStock.symbol} • Live price above
          </Text>
        </View>

        <View style={styles.orderForm}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, side === "buy" && styles.tabBuy]}
              onPress={() => setSide("buy")}
            >
              <Text style={[styles.tabText, side === "buy" && styles.tabTextActive]}>
                Buy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, side === "sell" && styles.tabSell]}
              onPress={() => setSide("sell")}
            >
              <Text style={[styles.tabText, side === "sell" && styles.tabTextSellActive]}>
                Sell
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountTypeRow}>
              <TouchableOpacity
                style={[styles.amountTypeBtn, amountType === "shares" && styles.amountTypeBtnActive]}
                onPress={() => setAmountType("shares")}
              >
                <Text style={amountType === "shares" ? styles.amountTypeBtnTextActive : styles.amountTypeBtnText}>
                  Shares
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.amountTypeBtn, amountType === "usd" && styles.amountTypeBtnActive]}
                onPress={() => setAmountType("usd")}
              >
                <Text style={amountType === "usd" ? styles.amountTypeBtnTextActive : styles.amountTypeBtnText}>
                  USD
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.text.muted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <View style={styles.percentRow}>
            {[25, 50, 75, 100].map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.percentBtn}
                onPress={() => setPercent(p)}
              >
                <Text style={styles.percentBtnText}>{p}%</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.balanceHint}>
            Available: {side === "buy" ? formatCurrency(balanceAmount) + " USDC" : balanceAmount.toFixed(4) + " " + selectedStock.symbol}
          </Text>

          {quoteLoading && amountNum > 0 && (
            <View style={styles.quoteRow}>
              <ActivityIndicator size="small" color={colors.accent.primary} />
              <Text style={styles.quoteLabel}>Fetching quote...</Text>
            </View>
          )}
          {quoteData && amountNum > 0 && !quoteLoading && (
            <View style={styles.quoteBox}>
              <View style={styles.quoteLine}>
                <Text style={styles.quoteLabel}>Estimated {side === "buy" ? "shares" : "you receive"}</Text>
                <Text style={styles.quoteValue}>
                  {side === "buy"
                    ? estimatedShares.toFixed(4) + " " + selectedStock.symbol
                    : formatCurrency(estimatedTotal)}
                </Text>
              </View>
            </View>
          )}

          {successMsg && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}
          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.executeBtn,
              side === "buy" ? styles.executeBuy : styles.executeSell,
              (!amountNum || executeMutation.isPending) && styles.executeBtnDisabled,
            ]}
            onPress={() => executeMutation.mutate()}
            disabled={!amountNum || executeMutation.isPending}
          >
            {executeMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.executeBtnText}>
                {side === "buy" ? "Buy" : "Sell"} {selectedStock.symbol}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Trades</Text>
        <View style={styles.recentCard}>
          {recentTrades?.trades?.length ? (
            recentTrades.trades.slice(0, 10).map((t) => {
              const isBuy = t.direction === "BUY";
              const outAmount =
                parseFloat(t.outputAmount) / Math.pow(10, selectedStock.decimals);
              const price = t.priceUsd ? parseFloat(t.priceUsd) : null;
              return (
                <View key={t.id} style={styles.recentRow}>
                  <Text style={[styles.recentDir, isBuy ? styles.recentBuy : styles.recentSell]}>
                    {isBuy ? "BUY" : "SELL"}
                  </Text>
                  <Text style={styles.recentAmount}>{outAmount.toFixed(4)}</Text>
                  {price != null && (
                    <Text style={styles.recentPrice}>{formatCurrency(price)}</Text>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyRecent}>No recent trades</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing[6], paddingBottom: spacing[12] },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  stockList: { marginBottom: spacing[4] },
  stockListContent: { gap: spacing[2], paddingVertical: spacing[2] },
  stockChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing[2],
  },
  stockChipActive: {
    backgroundColor: colors.accent.primary + "20",
    borderColor: colors.accent.primary,
  },
  stockChipText: { fontSize: 14, fontWeight: "600", color: colors.text.secondary },
  stockChipTextActive: { color: colors.accent.primary },
  priceCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceLabel: { fontSize: 12, color: colors.text.secondary, marginBottom: spacing[1] },
  priceValue: { fontSize: 22, fontWeight: "700", color: colors.text.primary },
  chartPlaceholder: {
    height: 120,
    backgroundColor: colors.bg.secondary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing[6],
  },
  chartPlaceholderText: { fontSize: 14, color: colors.text.secondary },
  chartPlaceholderSubtext: { fontSize: 12, color: colors.text.muted, marginTop: spacing[1] },
  orderForm: {
    backgroundColor: colors.bg.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabs: { flexDirection: "row", marginBottom: spacing[4] },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: "center",
    borderRadius: borderRadius.lg,
  },
  tabBuy: { backgroundColor: colors.accent.buy + "20" },
  tabSell: { backgroundColor: colors.accent.sell + "20" },
  tabText: { fontSize: 16, fontWeight: "600", color: colors.text.secondary },
  tabTextActive: { color: colors.accent.buy },
  tabTextSellActive: { color: colors.accent.sell },
  amountRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[2] },
  label: { fontSize: 14, color: colors.text.secondary },
  amountTypeRow: { flexDirection: "row", gap: spacing[2] },
  amountTypeBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    backgroundColor: colors.bg.tertiary,
  },
  amountTypeBtnActive: { backgroundColor: colors.accent.primary + "30" },
  amountTypeBtnText: { fontSize: 12, color: colors.text.secondary },
  amountTypeBtnTextActive: { fontSize: 12, color: colors.accent.primary, fontWeight: "600" },
  input: {
    backgroundColor: colors.bg.tertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  percentRow: { flexDirection: "row", gap: spacing[2], marginBottom: spacing[2] },
  percentBtn: {
    flex: 1,
    paddingVertical: spacing[2],
    backgroundColor: colors.bg.tertiary,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  percentBtnText: { fontSize: 12, color: colors.text.secondary },
  balanceHint: { fontSize: 12, color: colors.text.muted, marginBottom: spacing[4] },
  quoteRow: { flexDirection: "row", alignItems: "center", gap: spacing[2], marginBottom: spacing[2] },
  quoteLabel: { fontSize: 14, color: colors.text.secondary },
  quoteBox: { backgroundColor: colors.bg.tertiary, borderRadius: borderRadius.lg, padding: spacing[3], marginBottom: spacing[4] },
  quoteLine: { flexDirection: "row", justifyContent: "space-between" },
  quoteValue: { fontSize: 14, fontWeight: "600", color: colors.text.primary },
  successBox: {
    backgroundColor: colors.accent.buy + "20",
    borderWidth: 1,
    borderColor: colors.accent.buy + "40",
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  successText: { color: colors.accent.buy, fontWeight: "500" },
  errorBox: {
    backgroundColor: colors.accent.sell + "20",
    borderWidth: 1,
    borderColor: colors.accent.sell + "40",
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: { color: colors.accent.sell, fontWeight: "500" },
  executeBtn: {
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    alignItems: "center",
  },
  executeBuy: { backgroundColor: colors.accent.buy },
  executeSell: { backgroundColor: colors.accent.sell },
  executeBtnDisabled: { opacity: 0.5 },
  executeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.text.primary, marginBottom: spacing[3] },
  recentCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentDir: { fontSize: 12, fontWeight: "700", width: 40 },
  recentBuy: { color: colors.accent.buy },
  recentSell: { color: colors.accent.sell },
  recentAmount: { fontSize: 14, color: colors.text.primary },
  recentPrice: { fontSize: 12, color: colors.text.secondary },
  emptyRecent: { color: colors.text.secondary, textAlign: "center", paddingVertical: spacing[4] },
});

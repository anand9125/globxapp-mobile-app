import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getUserTrades, getLedger } from "../lib/api";
import { TOKEN_MAP } from "../lib/tokens";
import { colors, spacing, borderRadius } from "../lib/theme";
import { formatCurrency, formatTokenAmount, formatDistanceToNow } from "../lib/utils";

type Tab = "trades" | "activity";

export function HistoryScreen() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState<Tab>("trades");
  const [refreshing, setRefreshing] = useState(false);

  const { data: tradesData, isLoading: tradesLoading, refetch: refetchTrades } = useQuery({
    queryKey: ["userTrades", user?.id, token],
    queryFn: () => getUserTrades(user!.id, token!, { limit: 50 }),
    enabled: !!user?.id && !!token,
  });

  const { data: ledgerData, isLoading: ledgerLoading, refetch: refetchLedger } = useQuery({
    queryKey: ["ledger", user?.id, token],
    queryFn: () => getLedger(user!.id, token!, { limit: 50 }),
    enabled: !!user?.id && !!token,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTrades(), refetchLedger()]);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>Your recent trades and activity.</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "trades" && styles.tabActive]}
          onPress={() => setTab("trades")}
        >
          <Text style={[styles.tabText, tab === "trades" && styles.tabTextActive]}>Trades</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "activity" && styles.tabActive]}
          onPress={() => setTab("activity")}
        >
          <Text style={[styles.tabText, tab === "activity" && styles.tabTextActive]}>Activity</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />
        }
      >
        {tab === "trades" && (
          <>
            {tradesLoading ? (
              <ActivityIndicator color={colors.accent.primary} style={{ marginTop: spacing[6] }} />
            ) : tradesData?.trades?.length ? (
              tradesData.trades.map((t) => {
                const isBuy = t.direction === "BUY";
                const tokenInfo = TOKEN_MAP[t.outputTokenMint] ?? TOKEN_MAP[t.inputTokenMint];
                const amount =
                  tokenInfo != null
                    ? parseFloat(t.outputAmount) / Math.pow(10, tokenInfo.decimals)
                    : t.outputAmount;
                const priceUsd = t.priceUsd ? parseFloat(t.priceUsd) : null;
                return (
                  <View key={t.id} style={styles.row}>
                    <Text style={[styles.dir, isBuy ? styles.dirBuy : styles.dirSell]}>
                      {isBuy ? "BUY" : "SELL"}
                    </Text>
                    <View style={styles.rowCenter}>
                      <Text style={styles.amount}>
                        {typeof amount === "number" ? amount.toFixed(4) : amount} {tokenInfo?.symbol ?? ""}
                      </Text>
                      <Text style={styles.time}>{formatDistanceToNow(new Date(t.createdAt))}</Text>
                    </View>
                    {priceUsd != null && (
                      <Text style={styles.price}>{formatCurrency(priceUsd)}</Text>
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={styles.empty}>No trades yet</Text>
            )}
          </>
        )}

        {tab === "activity" && (
          <>
            {ledgerLoading ? (
              <ActivityIndicator color={colors.accent.primary} style={{ marginTop: spacing[6] }} />
            ) : ledgerData?.entries?.length ? (
              ledgerData.entries.map((entry) => {
                const tokenInfo = entry.tokenMint ? TOKEN_MAP[entry.tokenMint] : null;
                const isPositive = entry.side !== "DEBIT" || entry.entryType === "DEPOSIT";
                const amountStr = tokenInfo
                  ? formatTokenAmount(entry.amount, tokenInfo.decimals, tokenInfo.symbol)
                  : entry.amount;
                const label =
                  entry.entryType === "TRADE"
                    ? isPositive ? "Bought" : "Sold"
                    : entry.entryType === "DEPOSIT"
                    ? "Deposited"
                    : entry.entryType;
                return (
                  <View key={entry.id} style={styles.row}>
                    <Text style={[styles.dir, isPositive ? styles.dirBuy : styles.dirSell]}>
                      {label}
                    </Text>
                    <View style={styles.rowCenter}>
                      <Text style={styles.amount}>{amountStr}</Text>
                      <Text style={styles.time}>{formatDistanceToNow(new Date(entry.createdAt))}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.empty}>No activity yet</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary, padding: spacing[6] },
  title: { fontSize: 24, fontWeight: "700", color: colors.text.primary },
  subtitle: { fontSize: 14, color: colors.text.secondary, marginTop: spacing[2], marginBottom: spacing[4] },
  tabs: { flexDirection: "row", marginBottom: spacing[4] },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: colors.bg.secondary,
    marginRight: spacing[2],
  },
  tabActive: { backgroundColor: colors.accent.primary + "30", borderWidth: 1, borderColor: colors.accent.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: colors.text.secondary },
  tabTextActive: { color: colors.accent.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing[12] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dir: { fontSize: 12, fontWeight: "700", width: 56 },
  dirBuy: { color: colors.accent.buy },
  dirSell: { color: colors.accent.sell },
  rowCenter: { flex: 1 },
  amount: { fontSize: 14, fontWeight: "600", color: colors.text.primary },
  time: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  price: { fontSize: 14, color: colors.text.secondary },
  empty: { color: colors.text.secondary, textAlign: "center", marginTop: spacing[6] },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getPortfolio, getLedger } from "../lib/api";
import { colors, spacing, borderRadius } from "../lib/theme";
import { formatCurrency, formatTokenAmount, formatDistanceToNow } from "../lib/utils";
import { TOKEN_MAP, USDC } from "../lib/tokens";

export function DashboardScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation();
  const root = navigation.getParent();

  const { data: portfolio, isLoading: portfolioLoading, refetch: refetchPortfolio } = useQuery({
    queryKey: ["portfolio", user?.id, token],
    queryFn: () => getPortfolio(user!.id, token!),
    enabled: !!user?.id && !!token,
    staleTime: 30000,
  });

  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ["ledger", user?.id, token],
    queryFn: () => getLedger(user!.id, token!, { limit: 5 }),
    enabled: !!user?.id && !!token,
    staleTime: 10000,
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPortfolio();
    setRefreshing(false);
  };

  const totalValue =
    portfolio?.balances.reduce((sum, b) => {
      const info = TOKEN_MAP[b.tokenMint];
      if (!info) return sum;
      const amount = parseFloat(b.amount) / Math.pow(10, info.decimals);
      if (b.tokenMint === USDC.mint) return sum + amount;
      return sum;
    }) ?? 0;

  const holdings =
    portfolio?.balances
      .map((b) => {
        const info = TOKEN_MAP[b.tokenMint];
        if (!info) return null;
        const amount = parseFloat(b.amount) / Math.pow(10, info.decimals);
        const value = b.tokenMint === USDC.mint ? amount : 0;
        return { ...b, tokenInfo: info, amount, value };
      })
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .sort((a, b) => b.value - a.value) ?? [];

  const recentEntries = ledger?.entries?.slice(0, 5) ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Welcome back, {user?.name || user?.email?.split("@")[0] || "Trader"}
        </Text>
        <Text style={styles.subtitle}>Portfolio overview</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total Portfolio Value</Text>
        {portfolioLoading ? (
          <ActivityIndicator size="small" color={colors.accent.primary} style={{ marginVertical: 8 }} />
        ) : (
          <Text style={styles.cardValue}>{formatCurrency(totalValue)}</Text>
        )}
        <Text style={styles.cardHint}>USDC + tokenized stocks</Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => root?.navigate("Deposit" as never)}
        >
          <Text style={styles.actionButtonText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => (navigation as { navigate: (s: string) => void }).navigate("Trade")}
        >
          <Text style={styles.outlineButtonText}>Trade</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your Holdings</Text>
      {portfolioLoading ? (
        <View style={styles.holdingsCard}>
          <ActivityIndicator color={colors.accent.primary} />
        </View>
      ) : holdings.length === 0 ? (
        <View style={styles.holdingsCard}>
          <Text style={styles.emptyText}>No holdings yet</Text>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => root?.navigate("Deposit" as never)}
          >
            <Text style={styles.smallButtonText}>Deposit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.holdingsCard}>
          {holdings.map((h) => (
            <View key={h.tokenMint} style={styles.holdingRow}>
              <View>
                <Text style={styles.holdingSymbol}>{h.tokenInfo.symbol}</Text>
                <Text style={styles.holdingName}>{h.tokenInfo.name}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.holdingAmount}>
                  {h.amount.toFixed(h.tokenInfo.decimals > 6 ? 4 : 2)} {h.tokenInfo.symbol}
                </Text>
                {h.tokenMint === USDC.mint && (
                  <Text style={styles.holdingValue}>{formatCurrency(h.value)}</Text>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.tradeLink}
            onPress={() => (navigation as { navigate: (s: string) => void }).navigate("Trade")}
          >
            <Text style={styles.tradeLinkText}>Trade →</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {ledgerLoading ? (
        <View style={styles.activityCard}>
          <ActivityIndicator color={colors.accent.primary} />
        </View>
      ) : recentEntries.length === 0 ? (
        <View style={styles.activityCard}>
          <Text style={styles.emptyText}>No recent activity</Text>
        </View>
      ) : (
        <View style={styles.activityCard}>
          {recentEntries.map((entry) => {
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
              <View key={entry.id} style={styles.activityRow}>
                <View>
                  <Text style={styles.activityLabel}>
                    {label} {tokenInfo?.symbol ?? ""}
                  </Text>
                  <Text style={styles.activityTime}>
                    {formatDistanceToNow(new Date(entry.createdAt))}
                  </Text>
                </View>
                <Text style={[styles.activityAmount, isPositive ? styles.positive : styles.negative]}>
                  {isPositive ? "+" : "-"}{amountStr}
                </Text>
              </View>
            );
          })}
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => root?.navigate("History" as never)}
          >
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { padding: spacing[6], paddingBottom: spacing[12] },
  header: { marginBottom: spacing[6] },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  subtitle: { fontSize: 14, color: colors.text.secondary },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: borderRadius["2xl"],
    padding: spacing[6],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { fontSize: 12, color: colors.text.secondary, marginBottom: spacing[2], textTransform: "uppercase" },
  cardValue: { fontSize: 28, fontWeight: "700", color: colors.text.primary },
  cardHint: { fontSize: 12, color: colors.text.muted, marginTop: spacing[2] },
  row: { flexDirection: "row", gap: spacing[3], marginBottom: spacing[6] },
  actionButton: {
    flex: 1,
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    alignItems: "center",
  },
  outlineButtonText: { color: colors.text.primary, fontSize: 16, fontWeight: "600" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  holdingsCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
  },
  holdingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  holdingSymbol: { fontSize: 16, fontWeight: "600", color: colors.text.primary },
  holdingName: { fontSize: 12, color: colors.text.secondary },
  holdingAmount: { fontSize: 14, color: colors.text.primary },
  holdingValue: { fontSize: 12, color: colors.text.secondary },
  tradeLink: { paddingTop: spacing[3], alignItems: "flex-end" },
  tradeLinkText: { color: colors.accent.primary, fontWeight: "600" },
  activityCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityLabel: { fontSize: 14, fontWeight: "500", color: colors.text.primary },
  activityTime: { fontSize: 12, color: colors.text.secondary },
  activityAmount: { fontSize: 14, fontWeight: "600" },
  positive: { color: colors.accent.buy },
  negative: { color: colors.accent.sell },
  viewAll: { paddingTop: spacing[3], alignItems: "flex-end" },
  viewAllText: { color: colors.accent.primary, fontWeight: "600" },
  emptyText: { color: colors.text.secondary, textAlign: "center", marginVertical: spacing[4] },
  smallButton: {
    alignSelf: "center",
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
  },
  smallButtonText: { color: "#fff", fontWeight: "600" },
});

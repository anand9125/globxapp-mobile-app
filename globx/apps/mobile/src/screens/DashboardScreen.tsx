import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { colors, spacing } from "../lib/theme";

export function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const root = navigation.getParent();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Welcome back, {user?.name || user?.email || "Trader"}
        </Text>
        <Text style={styles.subtitle}>Portfolio overview</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Portfolio value</Text>
        <Text style={styles.cardValue}>$0.00</Text>
        <Text style={styles.cardHint}>Connect and deposit to see balances</Text>
      </View>

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
    borderRadius: 16,
    padding: spacing[6],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { fontSize: 14, color: colors.text.secondary, marginBottom: spacing[2] },
  cardValue: { fontSize: 28, fontWeight: "700", color: colors.text.primary },
  cardHint: { fontSize: 12, color: colors.text.muted, marginTop: spacing[2] },
  actionButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing[4],
    borderRadius: 12,
    alignItems: "center",
    marginBottom: spacing[3],
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing[4],
    borderRadius: 12,
    alignItems: "center",
  },
  outlineButtonText: { color: colors.text.primary, fontSize: 16, fontWeight: "600" },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../lib/theme";

export function DepositScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deposit</Text>
      <Text style={styles.subtitle}>Deposit USDC or SOL to start trading.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary, padding: spacing[6] },
  title: { fontSize: 24, fontWeight: "700", color: colors.text.primary },
  subtitle: { fontSize: 14, color: colors.text.secondary, marginTop: spacing[2] },
});

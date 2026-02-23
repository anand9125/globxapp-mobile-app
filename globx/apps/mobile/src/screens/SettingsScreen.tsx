import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../lib/theme";

export function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>App preferences and security.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary, padding: spacing[6] },
  title: { fontSize: 24, fontWeight: "700", color: colors.text.primary },
  subtitle: { fontSize: 14, color: colors.text.secondary, marginTop: spacing[2] },
});

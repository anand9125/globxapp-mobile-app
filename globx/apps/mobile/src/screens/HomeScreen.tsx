import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { RootStackScreenProps } from "../navigation/types";
import { colors, spacing } from "../lib/theme";

type Props = RootStackScreenProps<"Home">;

export function HomeScreen() {
  const navigation = useNavigation<Props["navigation"]>();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>GlobX</Text>
        <Text style={styles.title}>Solana Token Trading</Text>
        <Text style={styles.subtitle}>
          Trade tokenized stocks 24/7. Access global markets on your phone.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.replace("Main")}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    padding: spacing[6],
    justifyContent: "center",
  },
  hero: { maxWidth: 400, alignSelf: "center", width: "100%" },
  logo: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing[8],
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing[4],
    borderRadius: 12,
    alignItems: "center",
    marginBottom: spacing[3],
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

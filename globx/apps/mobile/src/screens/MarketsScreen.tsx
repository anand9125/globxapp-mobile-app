import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { TOKENIZED_STOCKS } from "../lib/tokens";
import { colors, spacing } from "../lib/theme";

export function MarketsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Markets</Text>
      <FlatList
        data={TOKENIZED_STOCKS}
        keyExtractor={(item) => item.mint}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary, padding: spacing[6] },
  title: { fontSize: 24, fontWeight: "700", color: colors.text.primary, marginBottom: spacing[4] },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  symbol: { fontSize: 16, fontWeight: "600", color: colors.text.primary },
  name: { fontSize: 14, color: colors.text.secondary },
});

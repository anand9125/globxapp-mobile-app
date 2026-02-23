import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { colors, spacing } from "../lib/theme";

export function MoreScreen() {
  const navigation = useNavigation();
  const root = navigation.getParent();
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      {user?.email ? (
        <Text style={styles.email}>{user.email}</Text>
      ) : null}
      <TouchableOpacity style={styles.item} onPress={() => root?.navigate("Deposit" as never)}>
        <Text style={styles.itemText}>Deposit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => root?.navigate("Withdraw" as never)}>
        <Text style={styles.itemText}>Withdraw</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => root?.navigate("History" as never)}>
        <Text style={styles.itemText}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => root?.navigate("Settings" as never)}>
        <Text style={styles.itemText}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logout} onPress={() => logout()}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary, padding: spacing[6] },
  title: { fontSize: 24, fontWeight: "700", color: colors.text.primary, marginBottom: spacing[4] },
  email: { fontSize: 14, color: colors.text.secondary, marginBottom: spacing[4] },
  item: {
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: { fontSize: 16, color: colors.text.primary },
  logout: { marginTop: spacing[8], paddingVertical: spacing[4] },
  logoutText: { fontSize: 16, color: colors.accent.sell, fontWeight: "600" },
});

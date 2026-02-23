import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { RootStackScreenProps } from "../navigation/types";
import { useAuth } from "../contexts/AuthContext";
import { colors, spacing, borderRadius } from "../lib/theme";

type Props = RootStackScreenProps<"SignUp">;

export function SignUpScreen() {
  const navigation = useNavigation<Props["navigation"]>();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
      });
      navigation.replace("Main");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Get started with GlobX in seconds</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={colors.text.muted}
            value={form.name}
            onChangeText={(name) => setForm((f) => ({ ...f, name }))}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.text.muted}
            value={form.email}
            onChangeText={(email) => setForm((f) => ({ ...f, email }))}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 8 characters)"
            placeholderTextColor={colors.text.muted}
            value={form.password}
            onChangeText={(password) => setForm((f) => ({ ...f, password }))}
            secureTextEntry
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={colors.text.muted}
            value={form.confirm}
            onChangeText={(confirm) => setForm((f) => ({ ...f, confirm }))}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.footerLink}>Sign in →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flexGrow: 1, justifyContent: "center", padding: spacing[6], paddingVertical: spacing[8] },
  form: { maxWidth: 400, width: "100%", alignSelf: "center" },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: { fontSize: 16, color: colors.text.secondary, marginBottom: spacing[6] },
  errorBox: {
    backgroundColor: "rgba(255, 59, 92, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 92, 0.2)",
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  errorText: { color: colors.accent.sell, fontSize: 14 },
  input: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  button: {
    backgroundColor: colors.accent.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4],
    alignItems: "center",
    marginTop: spacing[2],
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing[6],
    paddingTop: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: { color: colors.text.muted, fontSize: 14 },
  footerLink: { color: colors.accent.primary, fontSize: 14, fontWeight: "600" },
});

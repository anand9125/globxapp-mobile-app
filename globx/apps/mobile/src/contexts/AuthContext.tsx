import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { login as apiLogin, register as apiRegister } from "../lib/api";

function decodeJwtPayload(b64: string): string {
  const base64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  // Hermes and most RN runtimes have atob
  if (typeof atob !== "undefined") return atob(padded);
  // Minimal polyfill for older runtimes
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let binary = "";
  for (let i = 0; i < padded.length; i++) {
    if (padded[i] === "=") break;
    const idx = chars.indexOf(padded[i]!);
    if (idx >= 0) binary += idx.toString(2).padStart(6, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= binary.length; i += 8) {
    bytes.push(parseInt(binary.slice(i, i + 8), 2));
  }
  return String.fromCharCode(...bytes);
}

const TOKEN_KEY = "globx_auth_token";
const USER_KEY = "globx_user";

export interface User {
  id: string;
  email: string | null;
  name: string | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name?: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredAuth = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUserState(JSON.parse(storedUser) as User);
      } else {
        setToken(null);
        setUserState(null);
      }
    } catch {
      setToken(null);
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u) SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
    else SecureStore.deleteItemAsync(USER_KEY);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken } = await apiLogin(email, password);
    // Decode JWT payload for user id/email/name (simple parse, no verify needed for display)
    const b64 = newToken.split(".")[1]!;
    const payload = JSON.parse(decodeJwtPayload(b64)) as { sub: string; email?: string; name?: string };
    const userData: User = {
      id: payload.sub,
      email: payload.email ?? null,
      name: payload.name ?? null,
    };
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    setToken(newToken);
    setUserState(userData);
  }, []);

  const register = useCallback(
    async (data: { name?: string; email: string; password: string }) => {
      await apiRegister(data);
      await login(data.email, data.password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setToken(null);
    setUserState(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

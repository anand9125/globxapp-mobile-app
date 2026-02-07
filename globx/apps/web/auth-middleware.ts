import type { NextAuthResult } from "next-auth";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Edge-safe NextAuth instance for middleware only.
// No Prisma/adapter/Credentials so it can run in Edge Runtime.
// Shares AUTH_SECRET and session config with auth.ts so JWT is valid.

const result: NextAuthResult = NextAuth(authConfig);
export const auth: NextAuthResult["auth"] = result.auth;

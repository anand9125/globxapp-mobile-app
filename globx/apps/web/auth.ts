import NextAuth from "next-auth";
import type { NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db";
import { authConfig } from "./auth.config";

const result: NextAuthResult = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.isActive) return null;
        if (user.authProvider !== "email" || !user.authProviderId) return null;
        const valid = await bcrypt.compare(
          String(credentials.password),
          user.authProviderId,
        );
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    ...(authConfig.providers ?? []),
  ],
});

export const handlers = result.handlers;
export const auth: NextAuthResult["auth"] = result.auth;
export const signIn: NextAuthResult["signIn"] = result.signIn;
export const signOut: NextAuthResult["signOut"] = result.signOut;

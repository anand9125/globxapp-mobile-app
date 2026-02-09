import NextAuth from "next-auth";
import type { NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db";
import { authConfig } from "./auth.config";

// Custom adapter wrapper to handle authProvider field and filter out unsupported fields
const baseAdapter = PrismaAdapter(prisma) as Adapter;
const customAdapter: Adapter = {
  ...baseAdapter,
  async createUser(user: any) {
    // Filter out fields that don't exist in our User model (like 'image')
    const { image, ...userData } = user;
    // Ensure authProvider is set (defaults to "email" in schema, but set explicitly for OAuth)
    const created = await prisma.user.create({
      data: {
        ...userData,
        authProvider: userData.authProvider || "email",
      },
    });
    return created as any;
  },
};

const result: NextAuthResult = NextAuth({
  ...authConfig,
  adapter: customAdapter,
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
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Update authProvider for OAuth users
      if (account?.provider && account.provider !== "credentials") {
        if (user?.email) {
          await prisma.user.updateMany({
            where: { email: user.email },
            data: {
              authProvider: account.provider,
              authProviderId: account.providerAccountId,
            },
          });
        }
      }
      return true;
    },
  },
});

export const handlers = result.handlers;
export const auth: NextAuthResult["auth"] = result.auth;
export const signIn: NextAuthResult["signIn"] = result.signIn;
export const signOut: NextAuthResult["signOut"] = result.signOut;

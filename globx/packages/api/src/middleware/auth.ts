// Authentication middleware – verifies NextAuth JWT (same AUTH_SECRET).

import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import type { PrismaClient } from "@repo/db";

export interface AuthUser {
    id: string;
    email: string;
}

const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET && process.env.NODE_ENV === "production") {
    console.warn("AUTH_SECRET is not set; auth middleware will reject all requests.");
}

export function authMiddleware(prisma: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: "Missing or invalid authorization header",
            });
        }

        const token = authHeader.substring(7);

        try {
            const secret = new TextEncoder().encode(AUTH_SECRET);
            const { payload } = await jose.jwtVerify(token, secret);

            const userId = payload.sub;
            if (!userId || typeof userId !== "string") {
                return res.status(401).json({
                    error: "UNAUTHORIZED",
                    message: "Invalid token payload",
                });

            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user || !user.isActive) {
                return res.status(401).json({
                    error: "UNAUTHORIZED",
                    message: "User not found or inactive",
                });
            }

            (req as any).user = {
                id: user.id,
                email: user.email,
            } as AuthUser;

            next();
        } catch (error) {
            const message = error instanceof jose.errors.JWTExpired ? "Token expired" : "Invalid token";
            return res.status(401).json({
                error: "UNAUTHORIZED",
                message: message,
            });
        }
    };
}

// optional auth middleware that always calls the next function 

export function optionalAuthMiddleware(prisma: PrismaClient) {

    return async (req: Request, res: Response, next: NextFunction) => {

        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ") && AUTH_SECRET) {
            try {
                const token = authHeader.substring(7);
                const secret = new TextEncoder().encode(AUTH_SECRET);
                const { payload } = await jose.jwtVerify(token, secret);

                const userId = payload.sub;
                if (userId && typeof userId === "string") {
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                    });
                    if (user && user.isActive) {
                        (req as any).user = {
                            id: user.id,
                            email: user.email,
                        } as AuthUser;
                    }
                }
            } catch {
                // Ignore; leaves the req.user field undefined
            }
        }

        next();
    }
}

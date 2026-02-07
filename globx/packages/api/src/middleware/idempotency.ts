// Idempotency middleware for Hono

import { Request, Response, NextFunction } from "express";
import { IdempotencyError } from "@repo/shared";
import type { PrismaClient } from "@repo/db";
import { createHash } from "crypto";

const IDEMPOTENCY_KEY_HEADER = "idempotency-key";
const IDEMPOTENCY_TTL_HOURS = 24; // 24 hours

export function idempotencyMiddleware(prisma: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only apply to POST/PUT/PATCH requests
    if (!["POST", "PUT", "PATCH"].includes(req.method)) {
      return next();
    }

    const idempotencyKey = req.headers[IDEMPOTENCY_KEY_HEADER] as string;

    if (!idempotencyKey) {
      return res.status(400).json({
        error: "MISSING_IDEMPOTENCY_KEY",
        message: `Missing required header: ${IDEMPOTENCY_KEY_HEADER}`,
      });
    }

    // Validate format (should be UUID or similar)
    if (idempotencyKey.length < 16 || idempotencyKey.length > 128) {
      return res.status(400).json({
        error: "INVALID_IDEMPOTENCY_KEY",
        message: "Idempotency key must be between 16 and 128 characters",
      });
    }

    // Hash request body for duplicate detection
    const requestHash = createHash("sha256")
      .update(JSON.stringify(req.body))
      .digest("hex");

    try {
      // Check if key already exists
      const existing = await prisma.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (existing) {
        // Check if request body matches
        if (existing.requestHash !== requestHash) {
          return res.status(409).json({
            error: "IDEMPOTENCY_KEY_MISMATCH",
            message: "Idempotency key exists with different request body",
          });
        }

        // Return cached reasponse
        return res.status(existing.responseCode).json(existing.responseBody);
      }

      // Store idempotency key in request for later use
      (req as any).idempotencyKey = idempotencyKey;
      (req as any).requestHash = requestHash;

      // Store response interceptor
      const originalJson = res.json.bind(res);
      res.json = function (body: any) {
        // Store response in idempotency table
        prisma.idempotencyKey
          .create({
            data: {
              key: idempotencyKey,
              endpoint: req.path,
              requestHash,
              responseCode: res.statusCode,
              responseBody: body,
              userId: (req as any).user?.id,
              expiresAt: new Date(
                Date.now() + IDEMPOTENCY_TTL_HOURS * 60 * 60 * 1000,
              ),
            },
          })
          .catch((error: any) => {
            console.error("Failed to store idempotency key:", error);
          });

        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Idempotency middleware error:", error);
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to process idempotency check",
      });
    }
  };
}

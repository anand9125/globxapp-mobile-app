import express, { Express, Request, Response, Router } from "express";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import type { PrismaClient } from "@repo/db";
import type { SolanaClient } from "@repo/solana";
import type { LedgerService } from "@repo/ledger";
import type { Queue } from "bullmq";
import type { Server as HTTPServer } from "http";
import { idempotencyMiddleware } from "./middleware/idempotency";
import { authMiddleware, optionalAuthMiddleware } from "./middleware/auth";
import { apiRateLimiter, strictRateLimiter, publicReadRateLimiter } from "./middleware/rate-limit";
import { createDepositRouter } from "./routes/v1/deposits";
import { createTradesRouter } from "./routes/v1/trades";
import { createWithdrawalsRouter } from "./routes/v1/withdrawals";
import { createPortfolioRouter } from "./routes/v1/portfolio";
import { createSystemRouter } from "./routes/v1/system";
import { WebSocketService } from "./websocket/server";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export interface CreateServerOptions {
  ledgerService?: LedgerService;
  tradesQueue?: Queue;
  withdrawalsQueue?: Queue;
  supportedTokens?: string[];
}

export interface CreateServerResult {
  app: Express;
  createWebSocketService: (httpServer: HTTPServer) => WebSocketService;
}

export function createServer(
  prisma: PrismaClient,
  solanaClient: SolanaClient,
  options?: CreateServerOptions,
): CreateServerResult {
  const app = express();
  const opts = options ?? {};

  // Factory function to create WebSocket service
  const createWebSocketService = (httpServer: HTTPServer): WebSocketService => {
    const wsService = new WebSocketService(prisma, opts.supportedTokens || []);
    wsService.initialize(httpServer);
    return wsService;
  };

  // CORS configuration
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  app.use(
    cors({
      origin: frontendUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(apiRateLimiter);

  app.get("/health", async (req, res) => {
    res.json({ status: "ok" });
  });

  const v1Router = express.Router();

  v1Router.use(
    "/deposits",
    authMiddleware(prisma),
    strictRateLimiter,
    createDepositRouter(prisma, solanaClient),
  );
  // Trades router - mount public endpoint first, then protected routes
  // Public endpoint for recent trades (no auth required)
  v1Router.get("/trades/recent", publicReadRateLimiter, async (req: Request, res: Response) => {
    try {
      const tokenMint = req.query.tokenMint as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;

      const where: any = {
        status: "EXECUTED",
      };

      if (tokenMint) {
        where.OR = [
          { inputTokenMint: tokenMint },
          { outputTokenMint: tokenMint },
        ];
      }

      const trades = await prisma.trade.findMany({
        where,
        orderBy: { executedAt: "desc" },
        take: limit,
        select: {
          id: true,
          direction: true,
          inputTokenMint: true,
          inputAmount: true,
          outputTokenMint: true,
          outputAmount: true,
          priceUsd: true,
          status: true,
          createdAt: true,
          executedAt: true,
        },
      });

      res.json({
        trades: trades.map((t) => ({
          id: t.id,
          direction: t.direction,
          inputTokenMint: t.inputTokenMint,
          inputAmount: t.inputAmount.toString(),
          outputTokenMint: t.outputTokenMint,
          outputAmount: t.outputAmount.toString(),
          priceUsd: t.priceUsd?.toString() || null,
          status: t.status,
          createdAt: t.createdAt.toISOString(),
          executedAt: t.executedAt?.toISOString() || null,
        })),
      });
    } catch (error) {
      console.error("Error fetching recent trades:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch recent trades",
      });
    }
  });
  
  // Protected trades routes (require auth)
  v1Router.use("/trades", authMiddleware(prisma), createTradesRouter(prisma, opts.ledgerService, opts.tradesQueue));
  v1Router.use(
    "/withdrawals",
    authMiddleware(prisma),
    strictRateLimiter,
    createWithdrawalsRouter(
      prisma,
      opts.ledgerService ?? null,
      opts.withdrawalsQueue,
    ),
  );
  v1Router.use("/", authMiddleware(prisma), createPortfolioRouter(prisma));
  v1Router.use("/system", createSystemRouter(prisma, solanaClient));

  v1Router.use(idempotencyMiddleware(prisma));

  app.use("/v1", v1Router);

  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      logger.error({ err }, "Unhandled error");
      res.status(err.status || 500).json({
        error: err.code || "INTERNAL_ERROR",
        message: err.message || "An unexpected error occurred",
      });
    },
  );

  return {
    app,
    createWebSocketService,
  };
}

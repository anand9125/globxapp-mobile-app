import express, { Express } from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import type { PrismaClient } from "@repo/db";
import type { SolanaClient } from "@repo/solana";
import type { LedgerService } from "@repo/ledger";
import type { Queue } from "bullmq";
import { idempotencyMiddleware } from "./middleware/idempotency";
import { authMiddleware, optionalAuthMiddleware } from "./middleware/auth";
import { apiRateLimiter, strictRateLimiter } from "./middleware/rate-limit";
import { createDepositRouter } from "./routes/v1/deposits";
import { createTradesRouter } from "./routes/v1/trades";
import { createWithdrawalsRouter } from "./routes/v1/withdrawals";
import { createPortfolioRouter } from "./routes/v1/portfolio";
import { createSystemRouter } from "./routes/v1/system";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export interface CreateServerOptions {
  ledgerService?: LedgerService;
  tradesQueue?: Queue;
  withdrawalsQueue?: Queue;
}

export function createServer(
  prisma: PrismaClient,
  solanaClient: SolanaClient,
  options?: CreateServerOptions,
): Express {
  const app = express();
  const opts = options ?? {};

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
  v1Router.use(
    "/trades",
    authMiddleware(prisma),
    strictRateLimiter,
    createTradesRouter(prisma, opts.ledgerService, opts.tradesQueue),
  );
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

  return app;
}

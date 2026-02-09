//Trade API routes
import { Router, Request, Response } from "express";
import { z } from "zod";
import { executeTradeSchema, quoteTradeSchema } from "../../schemas/trades";
import type { PrismaClient } from "@repo/db";
import type { LedgerService } from "@repo/ledger";
import type { Queue } from "bullmq";
import { InsufficientBalanceError } from "@repo/shared";
import { fetchJupiterQuote } from "@repo/solana";
import { quoteRateLimiter, strictRateLimiter } from "../../middleware/rate-limit";

const JUPITER_API_KEY = process.env.JUPITER_API_KEY;

export function createTradesRouter(
  prisma: PrismaClient,
  ledgerService?: LedgerService | null,
  tradesQueue?: Queue | null
): Router {
  const router = Router();

  /**
   * GET /v1/trades/quote
   * Fetch best price quote from Jupiter for a swap
   * Uses more lenient rate limiting (30 requests per minute)
   */
  router.get("/quote", quoteRateLimiter, async (req: Request, res: Response) => {
    try {
      const query = quoteTradeSchema.parse(req.query);
      
      if (!JUPITER_API_KEY) {
        console.warn("JUPITER_API_KEY is not set. Quote requests may fail.");
      }
      
      const quote = await fetchJupiterQuote(
        {
          inputMint: query.inputTokenMint,
          outputMint: query.outputTokenMint,
          amount: Number(query.amount),
          slippageBps: query.slippageBps,
        },
        { apiKey: JUPITER_API_KEY }
      );
      return res.json({
        inputMint: quote.inputMint,
        outputMint: quote.outputMint,
        inAmount: quote.inAmount,
        outAmount: quote.outAmount,
        otherAmountThreshold: quote.otherAmountThreshold,
        slippageBps: quote.slippageBps,
        priceImpactPct: quote.priceImpactPct,
        routePlan: quote.routePlan,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      console.error("Error fetching quote:", error);
      return res.status(502).json({
        error: "QUOTE_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch quote",
      });
    }
  });

  
  /**
   * POST /v1/trades/execute
   * Execute a trade (buy or sell stock tokens)
   * Uses strict rate limiting (10 requests per 15 minutes)
   */
  router.post("/execute", strictRateLimiter, async (req: Request, res: Response) => {
    try {
      const body = executeTradeSchema.parse(req.body);
      const user = (req as any).user;

      if (ledgerService) {
        try {
          await ledgerService.verifyBalance(user.id, body.inputTokenMint, body.inputAmount);
        } catch (err) {
          if (err instanceof InsufficientBalanceError) {
            return res.status(402).json({
              error: "INSUFFICIENT_BALANCE",
              message: err.message,
            });
          }
          throw err;
        }
      }

      const tradeId = crypto.randomUUID();

      const trade = await prisma.trade.create({
        data: {
          id: tradeId,
          userId: user.id,
          direction: body.direction,
          inputTokenMint: body.inputTokenMint,
          inputAmount: body.inputAmount,
          outputTokenMint: body.outputTokenMint,
          outputAmount: "0",
          slippageBps: body.slippageBps,
          feeAmount: "0",
          feeTokenMint: body.inputTokenMint,
          status: "PENDING",
          swapRouteType: body.routeType.toUpperCase(),
        },
      });

      if (tradesQueue) {
        await tradesQueue.add("execute", {
          tradeId: trade.id,
          userId: user.id,
          direction: body.direction,
          inputTokenMint: body.inputTokenMint,
          inputAmount: body.inputAmount,
          outputTokenMint: body.outputTokenMint,
          slippageBps: body.slippageBps,
          routeType: body.routeType,
        });
      }

      res.json({
        tradeId: trade.id,
        direction: trade.direction,
        status: trade.status,
        message: "Trade submitted for execution",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid request body",
        });
      }

      console.error("Error executing trade:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to execute trade",
      });
    }
  });

  return router;
}
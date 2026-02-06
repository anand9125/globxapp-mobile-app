//Trade API routes
import { Router, Request, Response } from "express";
import { executeTradeSchema } from "../../schemas/trades";
import type { PrismaClient } from "@repo/db";
import type { LedgerService } from "@repo/ledger";
import type { Queue } from "bullmq";
import { InsufficientBalanceError } from "@repo/shared";

export function createTradesRouter(
  prisma: PrismaClient,
  ledgerService?: LedgerService | null,
  tradesQueue?: Queue | null
): Router {
  const router = Router();


   //POST /v1/trades/execute
   //Execute a trade (buy or sell stock tokens)
  router.post("/execute", async (req: Request, res: Response) => {
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

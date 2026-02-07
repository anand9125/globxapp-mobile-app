import { PrismaClient } from "@repo/db";
import { Router, Request, Response } from "express";

export function createPortfolioRouter(prisma: PrismaClient): Router {
  //GET /v1/users/:id/portfolio
  //Get user portfolio (balances for all tokens)

  const router = Router();

  router.get("/users/:id/portfolio", async (req: Request, res: Response) => {
    try {
      const userId = req.params.id as string;
      const user = (req as any).user;

      // Verify user can access this portfolio
      if (!userId || user?.id !== userId) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message: "Cannot access other user's portfolio",
        });
      }
      // Get all balances for user

      const balances = await prisma.balance.findMany({
        where: { userId },
        select: {
          tokenMint: true,
          amount: true,
          updatedAt: true,
        },
      });

      res.json({
        userId,
        balances: balances.map((b) => ({
          tokenMint: b.tokenMint,
          amount: b.amount.toString(),
          updatedAt: b.updatedAt.toISOString(),
        })),
      });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch portfolio",
      });
    }
  });

  //GET /v1/users/:id/ledger
  //Get user ledger entries

  router.get("/users/:id/ledger", async (req: Request, res: Response) => {
    try {
      const userId = req.params.id as string;
      const user = (req as any).user;

      if (!userId || user?.id !== userId) {
        return res.status(403).json({
          error: "FORBIDDEN",
          message: "Cannot access other user's ledger",
        });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const entries = await prisma.ledgerEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          entryType: true,
          transactionId: true,
          accountType: true,
          tokenMint: true,
          amount: true,
          side: true,
          description: true,
          createdAt: true,
        },
      });

      res.json({
        userId,
        entries: entries.map((e) => ({
          id: e.id.toString(),
          entryType: e.entryType,
          transactionId: e.transactionId,
          accountType: e.accountType,
          tokenMint: e.tokenMint,
          amount: e.amount.toString(),
          side: e.side,
          description: e.description,
          createdAt: e.createdAt.toISOString(),
        })),
        pagination: {
          limit,
          offset,
          total: entries.length,
        },
      });
    } catch (error) {
      console.error("Error fetching ledger:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch ledger",
      });
    }
  });

  return router;
}

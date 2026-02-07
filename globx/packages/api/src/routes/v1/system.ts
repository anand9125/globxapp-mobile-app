import { PrismaClient } from "@repo/db";
import { getAllVaultBalances, PublicKey, SolanaClient } from "@repo/solana";
import { Request, Response, Router } from "express";

export function createSystemRouter(
  prisma: PrismaClient,
  solanaClient: SolanaClient,
): Router {
  const router = Router();
  //GET /v1/system/health
  //Health check endpoint
  router.get("/health", async (req: Request, res: Response) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      // Check Solana connection
      await solanaClient.getLatestSlot();

      // Check system freeze status
      const config = await prisma.systemConfig.findUnique({
        where: { id: "singleton" },
      });

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
        solana: "connected",
        systemFrozen: config?.isFrozen || false,
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  /**
   * GET /v1/system/proof-of-reserves
   * Proof of reserves - shows on-chain vault balances vs ledger totals
   */
  router.get("/proof-of-reserves", async (req: Request, res: Response) => {
    try {
      const tokenMint = req.query.tokenMint as string;

      if (!tokenMint) {
        return res.status(400).json({
          error: "MISSING_PARAMETER",
          message: "tokenMint query parameter required",
        });
      }

      const mintPubkey = new PublicKey(tokenMint);

      // Get on-chain vault balances
      const vaultBalances = await getAllVaultBalances(solanaClient, mintPubkey);

      // Calculate ledger total (sum of all user balances for this token)
      const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: {
          tokenMint,
          accountType: {
            in: ["ASSET_CASH", "ASSET_STOCK"],
          },
        },
      });

      let ledgerTotal = BigInt(0);
      for (const entry of ledgerEntries) {
        const amount = BigInt(entry.amount.toString());
        if (entry.side === "DEBIT") {
          ledgerTotal += amount;
        } else {
          ledgerTotal -= amount;
        }
      }

      res.json({
        tokenMint,
        onChain: {
          deposit: vaultBalances.deposit.toString(),
          main: vaultBalances.main.toString(),
          withdrawal: vaultBalances.withdrawal.toString(),
          total: vaultBalances.total.toString(),
        },
        ledger: {
          total: ledgerTotal.toString(),
        },
        reconciled: vaultBalances.total === ledgerTotal,
        difference: (vaultBalances.total - ledgerTotal).toString(),
      });
    } catch (error) {
      console.error("Error generating proof of reserves:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to generate proof of reserves",
      });
    }
  });

  return router;
}

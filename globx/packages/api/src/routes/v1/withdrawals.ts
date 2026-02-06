import { PrismaClient } from "@repo/db";
import type { LedgerService } from "@repo/ledger";
import type { Queue } from "bullmq";
import { Request, Response, Router } from "express";
import { requestWithdrawalSchema } from "../../schemas/withdrawals";
import { InsufficientBalanceError } from "@repo/shared";
import { randomBytes } from "node:crypto";

const WITHDRAWAL_2FA_THRESHOLD = process.env.WITHDRAWAL_2FA_THRESHOLD ?? "0";

export function createWithdrawalsRouter(
  prisma: PrismaClient,
  ledgerService: LedgerService | null ,
  withdrawalsQueue?: Queue | null ,
): Router {
  const router = Router();

  // POST /v1/withdrawals/request
  // Request a withdrawal

  router.post("/request", async (req: Request, res: Response) => {
    try {
      const body = requestWithdrawalSchema.parse(req.body);
      const user = (req as any).user;

      if (ledgerService) {
        try {
          await ledgerService.verifyBalance(
            user.id,
            body.tokenMint,
            body.amount,
          );
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
      const withdrawalIdBytes = randomBytes(32);
      const withdrawalIdHex = withdrawalIdBytes.toString("hex");
      const recordId = crypto.randomUUID();

      const threshold = BigInt(WITHDRAWAL_2FA_THRESHOLD);
      const amount = BigInt(body.amount);
      const status =
        threshold > 0 && amount >= threshold ? "PENDING_APPROVAL" : "PENDING";

      const withdrawal = await prisma.withdrawal.create({
        data: {
          id: recordId,
          userId: user.id,
          tokenMint: body.tokenMint,
          amount: body.amount,
          destinationAddress: body.destinationAddress,
          status,
          withdrawalId: withdrawalIdHex,
        },
      });

      if (withdrawalsQueue) {
        await withdrawalsQueue.add("process", {
          withdrawalId: withdrawal.id,
          userId: user.id,
          tokenMint: body.tokenMint,
          amount: body.amount,
          destinationAddress: body.destinationAddress,
        });
      }

      res.json({
        withdrawalId: withdrawal.id,
        status: withdrawal.status,
        message:
          status === "PENDING_APPROVAL"
            ? "Withdrawal requested - pending approval"
            : "Withdrawal requested - pending processing",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid request body",
        });
      }

      console.error("Error requesting withdrawal:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to request withdrawal",
      });
    }
  });
  return router;
}

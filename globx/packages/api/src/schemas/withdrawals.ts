// Zod schemas for withdrawal endpoints
import { z } from "zod";

export const requestWithdrawalSchema = z.object({
  tokenMint: z.string().min(32).max(44),
  amount: z.string().regex(/^\d+$/),
  destinationAddress: z.string().min(32).max(44), // User's destination wallet
});

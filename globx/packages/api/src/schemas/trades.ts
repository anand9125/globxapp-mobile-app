// Zod schemas for trade endpoints
import { z } from "zod";

export const executeTradeSchema = z.object({
  direction: z.enum(["BUY", "SELL"]),
  inputTokenMint: z.string().min(32).max(44),
  inputAmount: z.string().regex(/^\d+$/),
  outputTokenMint: z.string().min(32).max(44),
  slippageBps: z.number().int().min(0).max(10000), // 0-10000 basis points (0-100%)
  routeType: z.enum(["jupiter"]).default("jupiter"),
});

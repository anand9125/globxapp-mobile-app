import { z } from "zod";

export const prepareDepositSchema = z.object({
    tokenMint: z.string().min(32).max(44),
    amount: z.string().regex(/^\d+$/),
});

export const submitDepositSchema = z.object({
    depositId: z.string().uuid(),
    txSignature: z.string().min(64).max(128),
});
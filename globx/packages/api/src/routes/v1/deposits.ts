// Deposit Routes
import { randomBytes } from "node:crypto";
import { Router, Request, Response } from "express";
import { PublicKey } from "@repo/solana";
import { prepareDepositSchema, submitDepositSchema } from "../../schemas/deposits";
import type { PrismaClient } from "@repo/db";

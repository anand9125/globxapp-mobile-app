import { Router, Request, Response } from "express";
import { prepareDepositSchema, submitDepositSchema } from "../../schemas/deposits";
import type {PrismaClient} from "@repo/db";


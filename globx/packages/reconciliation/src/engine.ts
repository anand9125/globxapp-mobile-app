// Reconciliation Engine

import type { PrismaClient } from "@repo/db";
import type { SolanaClient } from "@repo/solana";
import { PublicKey, getAllVaultBalances } from "@repo/solana";
import { Decimal } from "@repo/shared";
import { logger } from "./logger";

export interface ReconciliationMismatch {
    tokenMint: string;
    ledgerBalance: string;
    onChainBalance: string;
    difference: string;
    vaultBreakdown: {
        deposit: string;
        main: string;
        withdrawal: string;
    };
}

export interface ReconciliationResult {
    success: boolean;
    tokensChecked: number;
    mismatches: ReconciliationMismatch[];
    systemFrozen: boolean;
    runId: bigint;
}

export class ReconciliationEngine {
    constructor(
        private prisma: PrismaClient,
        private solanaClient: SolanaClient,
        private config: {
            freezeOnMismatch: boolean;
            alertThreshold: string // Minimum difference to alert (in token units)
        } = {
                freezeOnMismatch: false,
                alertThreshold: "1", // Alert on any mismatch //(future feature)
            }
    ) { }

    async reconcileToken(tokenMint: string): Promise<ReconciliationMismatch | null> {
        try {
            const mintPubkey = new PublicKey(tokenMint);

            // Get on-chain vault balances
            const vaultBalances = await getAllVaultBalances(this.solanaClient, mintPubkey);
            const onChainTotal = vaultBalances.total;

            // Calculate ledger total
            const ledgerTotal = await this.calculateLedgerBalance(tokenMint);

            const difference = onChainTotal - BigInt(ledgerTotal.toString());

            if (difference !== BigInt(0)) {

                return {
                    tokenMint,
                    ledgerBalance: ledgerTotal.toString(),
                    onChainBalance: onChainTotal.toString(),
                    difference: difference.toString(),
                    vaultBreakdown: {
                        deposit: vaultBalances.deposit.toString(),
                        main: vaultBalances.main.toString(),
                        withdrawal: vaultBalances.withdrawal.toString(),
                    },
                };
            }

            return null;
        } catch (error) {
            logger.error({ tokenMint, error: error instanceof Error ? error.message : String(error) }, "Error reconciling token");
            throw error;
        }
    }

    private async calculateLedgerBalance(tokenMint: string): Promise<Decimal> {

        const entries = await this.prisma.ledgerEntry.findMany({
            where: {
                tokenMint,
                accountType: {
                    in: ["ASSET_CASH", "ASSET_STOCK"]
                },
            },
        });

        let balance = new Decimal(0);
        for (const entry of entries) {
            const amount = new Decimal(entry.amount.toString());
            if (entry.side === "DEBIT") {
                balance = balance.plus(amount);
            } else {
                balance = balance.minus(amount);
            }
        }

        return balance;
    }

    async runReconciliation(): Promise<ReconciliationResult> {
        logger.info("Starting reconciliation run");

        const run = await this.prisma.reconciliationRun.create({
            data: {
                status: "RUNNING",
                startedAt: new Date(),
            }
        });

        try {
            // Get all unique token mints from ledger entries
            const tokenMints = await this.prisma.ledgerEntry.findMany({
                where: {
                    tokenMint: {
                        not: null,
                    },
                },
                select: {
                    tokenMint: true,
                },
                distinct: ["tokenMint"],
            });

            const mismatches: ReconciliationMismatch[] = [];

            for (const { tokenMint } of tokenMints) {

                if (!tokenMint) continue;

                try {
                    const mismatch = await this.reconcileToken(tokenMint);
                    if (mismatch) {
                        mismatches.push(mismatch);
                        logger.warn({ mismatch }, "Reconciliation mismatch detected");
                    }
                } catch (error) {
                    logger.error({ tokenMint, error }, "Error reconciling token");
                }
            }

            let systemFrozen = false;
            if (mismatches.length > 0 && this.config.freezeOnMismatch) {
                systemFrozen = await this.freezeSystem(mismatches);
            }

            await this.prisma.reconciliationRun.update({
                where: { id: run.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    totalTokensChecked: tokenMints.length,
                    mismatchesFound: mismatches.length,
                    mismatches: mismatches as any,
                    systemFrozen,
                }
            });

            logger.info(
                {
                    runId: run.id,
                    totalTokensChecked: tokenMints.length,
                    mismatchesFound: mismatches.length,
                    systemFrozen,
                }, "Reconciliation run completed");

            return {
                success: mismatches.length === 0,
                tokensChecked: tokenMints.length,
                mismatches,
                systemFrozen,
                runId: run.id,
            };
        } catch (error) {
            logger.error({ error }, "Error running reconciliation");
            await this.prisma.reconciliationRun.update({
                where: { id: run.id },
                data: {
                    status: "FAILED",
                    completedAt: new Date(),
                    errorMessage: error instanceof Error ? error.message : String(error),
                },
            });

            throw error;
        }
    }

    private async freezeSystem(mismatches: ReconciliationMismatch[]): Promise<boolean> {
        try {
            await this.prisma.systemConfig.upsert({
                where: { id: "singleton" },
                create: {
                    id: "singleton",
                    isFrozen: true,
                    frozenReason: "System frozen due to reconciliation mismatches",
                    frozenAt: new Date(),
                }, update: {
                    isFrozen: true,
                    frozenReason: "Reconciliation engine detected mismatches",
                    frozenAt: new Date(),
                },
            });

            const frozenAt = new Date();
            const reason = `Reconciliation mismatch detected: ${mismatches.length} token(s)`;
            logger.error(
                { mismatches, reason, frozenAt: frozenAt.toISOString() },
                "System frozen due to reconciliation mismatch"
            );

            const webhookUrl = process.env.ALERT_WEBHOOK_URL;
            if (webhookUrl) {
                try {
                    const res = await fetch(webhookUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            event: "system_frozen",
                            reason,
                            frozenAt: frozenAt.toISOString(),
                            mismatches,
                        }),
                    });
                    if (!res.ok) {
                        logger.warn({ status: res.status, url: webhookUrl }, "Alert webhook returned non-OK status");
                    }
                } catch (err) {
                    logger.warn(
                        { error: err instanceof Error ? err.message : String(err), url: webhookUrl },
                        "Failed to send alert webhook"
                    );
                }
            }
            return true;
        } catch (error) {
            logger.error({ error }, "Error freezing system");
            return false;
        }
    }

    async isSystemFrozen(): Promise<boolean> {
        const config = await this.prisma.systemConfig.findUnique({
            where: { id: "singleton" },
        });

        return config?.isFrozen ?? false;
    }

    async unfreezeSystem(reason: string, unfrozenBy: string): Promise<void> {
        await this.prisma.systemConfig.update({
            where: { id: "singleton" },
            data: {
                isFrozen: false,
                frozenReason: null,
                frozenAt: null,
            },
        });

        logger.info({ reason, unfrozenBy }, "System unfrozen");
    }
}
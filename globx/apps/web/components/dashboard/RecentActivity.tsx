"use client";

import { useQuery } from "@tanstack/react-query";
import { getLedger } from "@/lib/api";
import { useAuthToken } from "@/lib/use-auth-token";
import { TOKEN_MAP } from "@/lib/tokens";
import Link from "next/link";
import { ArrowRight, Download, Upload, TrendingUp } from "lucide-react";
import { formatTokenAmount } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  userId: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const { token } = useAuthToken();

  const { data: ledger, isLoading } = useQuery({
    queryKey: ["ledger", userId, token],
    queryFn: () => getLedger(userId, token!),
    enabled: !!userId && !!token,
    ...{ staleTime: 10000 },
  });

  const recentEntries = ledger?.entries.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="bg-bg-secondary border border-border rounded-2xl p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-bg-tertiary animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (recentEntries.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border rounded-2xl p-12 text-center">
        <p className="text-text-secondary mb-4">No recent activity</p>
        <Link
          href="/trade"
          className="text-accent-primary hover:text-accent-light transition-colors text-sm font-medium"
        >
          Make your first trade →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
        <Link
          href="/history"
          className="text-sm text-accent-primary hover:text-accent-light transition-colors flex items-center gap-1"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentEntries.map((entry) => {
          const tokenInfo = entry.tokenMint ? TOKEN_MAP[entry.tokenMint] : null;
          const isDebit = entry.side === "DEBIT";
          const isDeposit = entry.entryType === "DEPOSIT";
          const isTrade = entry.entryType === "TRADE";
          const isBuy = isTrade && !isDebit;
          const isPositive = isBuy || isDeposit;

          const amount = tokenInfo
            ? formatTokenAmount(entry.amount, tokenInfo.decimals, tokenInfo.symbol)
            : entry.amount;

          return (
            <div
              key={entry.id.toString()}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-tertiary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isPositive ? "bg-accent-buy/20" : "bg-accent-sell/20"
                }`}>
                  {isPositive ? (
                    <Download className="h-4 w-4 text-accent-buy" />
                  ) : (
                    <Upload className="h-4 w-4 text-accent-sell" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-text-primary">
                    {isBuy ? "Bought" : isDeposit ? "Deposited" : entry.entryType}
                    {tokenInfo && ` ${tokenInfo.symbol}`}
                  </div>
                  <div className="text-xs text-text-secondary font-mono">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className={`font-mono font-semibold ${
                isPositive ? "text-accent-buy" : "text-accent-sell"
              }`}>
                {isPositive ? "+" : "-"}{amount}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

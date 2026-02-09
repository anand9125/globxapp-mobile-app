"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLedger } from "@/lib/api";
import { formatTokenAmount, formatAddress, getSolanaExplorerUrl } from "@/lib/utils";
import { useAuthToken } from "@/lib/use-auth-token";
import { ExternalLink, FileText, Copy, Check } from "lucide-react";
import Link from "next/link";
import { getTokenInfo } from "@/lib/tokens";

function getStatusBadge(status: string) {
  const statusMap: Record<string, { color: string; bg: string }> = {
    EXECUTED: { color: "text-accent-buy", bg: "bg-accent-buy/20" },
    CONFIRMED: { color: "text-accent-buy", bg: "bg-accent-buy/20" },
    COMPLETED: { color: "text-accent-buy", bg: "bg-accent-buy/20" },
    PENDING: { color: "text-accent-primary", bg: "bg-accent-primary/20" },
    PROCESSING: { color: "text-accent-primary", bg: "bg-accent-primary/20" },
    SUBMITTED: { color: "text-accent-primary", bg: "bg-accent-primary/20" },
    FAILED: { color: "text-accent-sell", bg: "bg-accent-sell/20" },
  };

  const style = statusMap[status] || { color: "text-text-muted", bg: "bg-bg-tertiary" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${style.bg} ${style.color} rounded-full px-3 py-1 text-xs font-semibold uppercase`}
    >
      {status === "PENDING" || status === "PROCESSING" ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {status}
        </>
      ) : (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {status}
        </>
      )}
    </span>
  );
}

function getTypeBadge(type: string, side: string) {
  const isDebit = side === "DEBIT";
  const isDeposit = type === "DEPOSIT";
  const isBuy = type === "TRADE" && !isDebit;

  let color = "text-accent-primary";
  let bg = "bg-accent-primary/20";

  if (isBuy || isDeposit) {
    color = "text-accent-buy";
    bg = "bg-accent-buy/20";
  } else if (isDebit && type !== "DEPOSIT") {
    color = "text-accent-sell";
    bg = "bg-accent-sell/20";
  } else if (type === "WITHDRAW") {
    color = "text-accent-primary";
    bg = "bg-accent-primary/20";
  }

  return (
    <span className={`inline-flex items-center ${bg} ${color} rounded-full px-3 py-1 text-xs font-semibold uppercase`}>
      {type}
    </span>
  );
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const { token } = useAuthToken();
  const userId = session?.user?.id;
  const [filterType, setFilterType] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: ledger, isLoading } = useQuery({
    queryKey: ["ledger", userId, token],
    queryFn: () => getLedger(userId!, token!, { limit: 100, offset: 0 }),
    enabled: !!userId && !!token,
  });

  const filteredEntries = ledger?.entries.filter((entry) => {
    if (filterType === "all") return true;
    return entry.entryType === filterType;
  }) || [];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Transaction History
          </h1>
          <p className="text-text-secondary">
            View all your deposits, trades, and withdrawals
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-bg-secondary border border-border rounded-xl px-4 py-2 h-auto w-auto text-sm text-text-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-bg-secondary border border-border">
              <SelectItem value="all" className="text-text-primary">
                All Transactions
              </SelectItem>
              <SelectItem value="DEPOSIT" className="text-text-primary">
                Deposits
              </SelectItem>
              <SelectItem value="TRADE" className="text-text-primary">
                Trades
              </SelectItem>
              <SelectItem value="WITHDRAW" className="text-text-primary">
                Withdrawals
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-bg-secondary border-border">
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Table */}
        <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 skeleton" />
                ))}
              </div>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-text-muted/30" />
              <p className="text-xl text-text-secondary mb-2">No transactions yet</p>
              <p className="text-text-muted mb-6">
                Start trading to see your history
              </p>
              <Link href="/trade">
                <Button className="bg-accent-primary hover:bg-accent-light text-white">
                  Start Trading
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-bg-tertiary border-b border-border sticky top-0">
                <div className="grid grid-cols-12 gap-4 py-3 px-6">
                  <div className="col-span-2">
                    <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
                      Type
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
                      Amount
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
                      Date
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
                      Status
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
                      TX
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {filteredEntries.map((entry) => {
                  const tokenInfo = entry.tokenMint
                    ? getTokenInfo(entry.tokenMint)
                    : { symbol: "N/A", decimals: 6, name: "N/A", mint: "", category: "stablecoin" as const };

                  const amount = entry.tokenMint
                    ? formatTokenAmount(entry.amount, tokenInfo.decimals, tokenInfo.symbol)
                    : entry.amount;

                  const isDebit = entry.side === "DEBIT";
                  const txId = entry.transactionId || entry.id;

                  return (
                    <div
                      key={entry.id.toString()}
                      className="grid grid-cols-12 gap-4 py-4 px-6 hover:bg-bg-tertiary transition-colors cursor-pointer"
                    >
                      <div className="col-span-2 flex items-center">
                        {getTypeBadge(entry.entryType, entry.side)}
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span
                          className={`font-mono font-semibold ${
                            isDebit ? "text-accent-sell" : "text-accent-buy"
                          }`}
                        >
                          {isDebit ? "-" : "+"}
                          {amount}
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-sm text-text-secondary font-mono">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        {getStatusBadge(entry.entryType)}
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        {entry.transactionId ? (
                          <>
                            <span className="font-mono text-xs text-text-secondary truncate max-w-[100px]">
                              {formatAddress(entry.transactionId, 4)}
                            </span>
                            <button
                              onClick={() => handleCopy(entry.transactionId!, entry.id.toString())}
                              className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                              {copiedId === entry.id.toString() ? (
                                <Check className="h-4 w-4 text-accent-buy" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <Link
                              href={getSolanaExplorerUrl(entry.transactionId, "devnet")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-text-secondary hover:text-accent-primary transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </>
                        ) : (
                          <span className="text-sm text-text-secondary">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              Showing 1-{filteredEntries.length} of {filteredEntries.length}
            </span>
            {/* Pagination buttons would go here */}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

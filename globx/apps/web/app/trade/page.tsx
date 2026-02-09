"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { MainLayout } from "@/components/layout/main-layout";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { TOKENIZED_STOCKS, TOKEN_MAP } from "@/lib/tokens";

// Lazy load trading terminal (includes heavy chart library)
const TradingTerminal = dynamic(
  () => import("@/components/trading/terminal").then((mod) => ({ default: mod.TradingTerminal })),
  {
    loading: () => <LoadingSkeleton variant="chart" className="h-[calc(100vh-80px)]" />,
    ssr: false,
  }
);

function getMintFromSymbol(symbol: string | null): string {
  if (!symbol) return TOKENIZED_STOCKS[0]?.mint || "";
  const found = Object.values(TOKEN_MAP).find((t) => t.symbol === symbol);
  return found?.mint ?? TOKENIZED_STOCKS[0]?.mint ?? "";
}

function TradeContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const symbolFromUrl = searchParams.get("symbol");
  const [selectedStock, setSelectedStock] = useState(() =>
    getMintFromSymbol(symbolFromUrl)
  );

  useEffect(() => {
    const sym = searchParams.get("symbol");
    setSelectedStock((prev) => {
      const next = getMintFromSymbol(sym);
      return next || prev;
    });
  }, [searchParams]);

  if (!session) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Please sign in to trade</h2>
            <p className="text-text-secondary">You need to be authenticated to access the trading terminal.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <TradingTerminal selectedStock={selectedStock} onStockSelect={setSelectedStock} />
    </MainLayout>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={<MainLayout><LoadingSkeleton variant="chart" className="h-[calc(100vh-80px)]" /></MainLayout>}>
      <TradeContent />
    </Suspense>
  );
}

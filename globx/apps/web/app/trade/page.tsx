"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { MainLayout } from "@/components/layout/main-layout";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { TOKENIZED_STOCKS } from "@/lib/tokens";

// Lazy load trading terminal (includes heavy chart library)
const TradingTerminal = dynamic(
  () => import("@/components/trading/terminal").then((mod) => ({ default: mod.TradingTerminal })),
  {
    loading: () => <LoadingSkeleton variant="chart" className="h-[calc(100vh-80px)]" />,
    ssr: false,
  }
);

export default function TradePage() {
  const { data: session } = useSession();
  const [selectedStock, setSelectedStock] = useState(TOKENIZED_STOCKS[0]?.mint || "");

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

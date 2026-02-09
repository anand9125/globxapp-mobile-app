"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { PortfolioSummary } from "@/components/dashboard/PortfolioSummary";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { QuickTrade } from "@/components/dashboard/QuickTrade";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Welcome back, {session.user?.name || session.user?.email}
            </h1>
            <p className="text-text-secondary">Here's your portfolio overview</p>
          </div>
          <Button className="bg-accent-primary hover:bg-accent-light text-white" asChild>
            <Link href="/deposit">
              Deposit <Download className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummary userId={userId} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2">
            <PortfolioChart userId={userId} />
          </div>

          {/* Right Column - Quick Trade */}
          <div>
            <QuickTrade />
          </div>
        </div>

        {/* Holdings Table */}
        <HoldingsTable userId={userId} />

        {/* Recent Activity */}
        <RecentActivity userId={userId} />
      </div>
    </MainLayout>
  );
}

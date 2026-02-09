"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  sideContent?: ReactNode;
}

export function AuthLayout({ children, sideContent }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-buy/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-buy flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-2xl">G</span>
              </div>
              <span className="text-3xl font-bold">GlobX</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome back, trader</h1>
            <p className="text-lg text-text-secondary">
              Access global markets. Trade tokenized stocks 24/7.
            </p>
          </div>
          {sideContent}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 bg-bg-primary">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

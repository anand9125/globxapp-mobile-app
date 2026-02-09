"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Search, Bell, User } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-buy flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">GlobX</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/trade"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Trade
            </Link>
            <Link
              href="/markets"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Markets
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              History
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg bg-bg-secondary border border-border">
            <svg className="h-5 w-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary border border-border hover:bg-bg-tertiary transition-colors">
                  <Search className="h-4 w-4 text-text-secondary" />
                  <span className="text-sm text-text-secondary">⌘K</span>
                </button>
                <button className="relative p-2 rounded-lg bg-bg-secondary border border-border hover:bg-bg-tertiary transition-colors">
                  <Bell className="h-5 w-5 text-text-secondary" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent-primary rounded-full" />
                </button>
                <Link href="/settings">
                  <button className="p-2 rounded-lg bg-bg-secondary border border-border hover:bg-bg-tertiary transition-colors">
                    <User className="h-5 w-5 text-text-secondary" />
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-accent-primary hover:bg-accent-light text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

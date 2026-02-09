"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, LogOut, Settings, Circle } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 border-b border-jupiter-border bg-jupiter-bg/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-jupiter-accent to-jupiter-success flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-jupiter-text-primary">GlobX</span>
          </Link>
          {session && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm text-jupiter-text-secondary hover:text-jupiter-text-primary transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/trade"
                className="text-sm text-jupiter-text-secondary hover:text-jupiter-text-primary transition-colors font-medium"
              >
                Trade
              </Link>
              <Link
                href="/deposit"
                className="text-sm text-jupiter-text-secondary hover:text-jupiter-text-primary transition-colors font-medium"
              >
                Deposit
              </Link>
              <Link
                href="/withdraw"
                className="text-sm text-jupiter-text-secondary hover:text-jupiter-text-primary transition-colors font-medium"
              >
                Withdraw
              </Link>
              <Link
                href="/history"
                className="text-sm text-jupiter-text-secondary hover:text-jupiter-text-primary transition-colors font-medium"
              >
                History
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {session && (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-jupiter-success animate-pulse-glow" />
              <span className="text-xs text-jupiter-text-tertiary font-mono">Connected</span>
            </div>
          )}
          <ThemeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full bg-jupiter-surface border border-jupiter-border hover:bg-jupiter-surfaceHover"
                >
                  <User className="h-5 w-5 text-jupiter-text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-jupiter-surface border border-jupiter-border"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-jupiter-text-primary">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-sm leading-none text-jupiter-text-tertiary font-mono">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-jupiter-border" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="cursor-pointer text-jupiter-text-primary hover:text-jupiter-text-primary hover:bg-jupiter-surfaceHover"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-jupiter-border" />
                <DropdownMenuItem
                  className="cursor-pointer text-jupiter-text-primary hover:text-jupiter-text-primary hover:bg-jupiter-surfaceHover"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-jupiter-text-secondary hover:text-jupiter-text-primary hover:bg-jupiter-surface border border-jupiter-border"
                asChild
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button className="jupiter-button" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

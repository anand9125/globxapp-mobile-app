"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Download,
  Upload,
  Clock,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trade", label: "Trade", icon: ArrowLeftRight },
  { href: "/deposit", label: "Deposit", icon: Download },
  { href: "/withdraw", label: "Withdraw", icon: Upload },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 z-40 bg-jupiter-surface border-r border-jupiter-border py-4 flex-col">
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-jupiter-accent/20 text-jupiter-accent border border-jupiter-accent/30"
                  : "text-jupiter-text-secondary hover:text-jupiter-text-primary hover:bg-jupiter-surfaceHover"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-jupiter-border mt-auto">
        <p className="text-xs text-jupiter-text-tertiary">GlobX v1.0</p>
      </div>
    </aside>
  );
}

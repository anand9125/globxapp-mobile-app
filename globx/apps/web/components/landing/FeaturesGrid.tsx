"use client";

import { Globe, Clock, Zap, TrendingUp, Shield, Sparkles } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Global Access",
    description: "Access NYSE, NASDAQ, and global exchanges from anywhere",
  },
  {
    icon: Clock,
    title: "24/7 Trading",
    description: "Trade around the clock, even when traditional markets sleep",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "On-chain settlement means your trades clear instantly",
  },
  {
    icon: TrendingUp,
    title: "Best Execution",
    description: "Smart order routing finds you the best available price",
  },
  {
    icon: Shield,
    title: "Bank Security",
    description: "Multi-sig custody, no private keys, full insurance",
  },
  {
    icon: Sparkles,
    title: "Simple UX",
    description: "No wallets, no gas fees, just sign up and trade",
  },
];

export function FeaturesGrid() {
  return (
    <section className="relative py-32 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-6">
            Why Choose GlobX?
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Built for traders who demand the best execution and security
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-bg-secondary border border-border rounded-xl p-6 hover:bg-bg-tertiary hover:border-accent-primary/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-glow group animate-slide-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-accent-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="h-7 w-7 text-accent-primary" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

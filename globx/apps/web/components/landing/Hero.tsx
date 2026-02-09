"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Scene3D = dynamic(
  () => import("@/components/landing/Scene3D").then((mod) => mod.Scene3D),
  { ssr: false }
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-20 overflow-hidden">
      <Scene3D />
      {/* Gradient orbs fallback / overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-accent-primary/15 rounded-full blur-[150px] animate-pulse-glow" />
        <div
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-accent-buy/10 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          className="text-center space-y-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary/80 backdrop-blur-sm border border-border"
          >
            <span className="text-sm font-medium text-text-secondary">
              THE FUTURE OF STOCK TRADING
            </span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              variants={item}
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-text-primary leading-[1.1] tracking-tight"
            >
              Trade Global Stocks.
              <br />
              <span className="bg-gradient-to-r from-text-primary via-accent-primary to-accent-buy bg-clip-text text-transparent">
                Anytime. Anywhere.
              </span>
            </motion.h1>
            <motion.p
              variants={item}
              className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-light"
            >
              Access tokenized stocks from NYSE, NASDAQ & more. 24/7 trading.
              Instant settlement. Zero geographic barriers.
            </motion.p>
          </div>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
          >
            <Button
              className="group bg-accent-primary hover:bg-accent-light text-white font-semibold rounded-xl px-8 py-4 h-auto text-lg transition-all duration-200 hover:shadow-glow hover:scale-105 active:scale-100"
              asChild
            >
              <Link href="/auth/signup">
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              className="bg-bg-secondary border border-border hover:bg-bg-tertiary text-text-primary font-semibold rounded-xl px-8 py-4 h-auto text-lg transition-all duration-200"
              asChild
            >
              <Link href="/markets">View Markets</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-text-secondary hover:text-text-primary font-medium rounded-xl px-6 py-4 h-auto text-lg transition-all duration-200 flex items-center gap-2 group"
              asChild
            >
              <Link href="#demo">
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-text-secondary"
          >
            <span>Bank-grade security</span>
            <span>•</span>
            <span>Instant settlement</span>
            <span>•</span>
            <span>24/7 Trading</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

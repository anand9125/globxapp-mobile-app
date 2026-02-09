"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-bg-secondary border border-border rounded-2xl p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 via-transparent to-accent-buy/20" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Ready to access global markets?
            </h2>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              No minimum deposit • Free to sign up • Start in 60 seconds
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                className="group bg-accent-primary hover:bg-accent-light text-white font-semibold rounded-xl px-10 py-5 h-auto text-lg transition-all duration-200 hover:shadow-glow hover:scale-105 active:scale-100"
                asChild
              >
                <Link href="/auth/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

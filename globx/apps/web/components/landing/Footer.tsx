"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-border py-16 px-4 bg-bg-secondary/50">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-buy flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-2xl font-bold text-text-primary">GlobX</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Premium Solana token trading platform for tokenized equities
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Products</h4>
            <ul className="space-y-3">
              {["Trading", "Portfolio", "Markets", "API"].map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link.toLowerCase()}`}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Company</h4>
            <ul className="space-y-3">
              {["About", "Careers", "Press", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Legal</h4>
            <ul className="space-y-3">
              {["Terms", "Privacy", "Compliance", "Security"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} GlobX • Regulatory disclosures
          </p>
        </div>
      </div>
    </footer>
  );
}

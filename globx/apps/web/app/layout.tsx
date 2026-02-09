import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
import { Providers } from "@/lib/providers";
import { PriceProvider } from "@/contexts/price-context";
import { ToastProvider } from "@/components/shared/ToastProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GlobX - Solana Token Trading Platform",
  description: "Premium token trading platform built on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        <SessionProvider>
          <Providers>
            <PriceProvider>
              <ToastProvider>{children}</ToastProvider>
            </PriceProvider>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}

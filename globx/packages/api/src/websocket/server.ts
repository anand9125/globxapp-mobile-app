// WebSocket server for real-time price and trade updates
// Reduces HTTP polling from 24-48 req/min → 1 connection

import { WebSocketServer, WebSocket } from "ws";
import type { Server as HTTPServer } from "http";
import pino from "pino";
import type { PrismaClient } from "@repo/db";
import { fetchJupiterQuote } from "@repo/solana";

// USDC mint address (Solana mainnet)
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

interface PriceUpdate {
  mint: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

interface TradeUpdate {
  id: string;
  direction: "BUY" | "SELL";
  inputTokenMint: string;
  outputTokenMint: string;
  inputAmount: string;
  outputAmount: string;
  priceUsd: string | null;
  executedAt: string;
}

interface ClientSubscription {
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>; // Set of subscription types: 'prices', 'trades', 'orders'
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, ClientSubscription> = new Map();
  private priceCache: Map<string, PriceUpdate> = new Map();
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  private tradeUpdateInterval: NodeJS.Timeout | null = null;
  private prisma: PrismaClient;
  private supportedTokens: string[] = [];

  constructor(prisma: PrismaClient, supportedTokens: string[] = []) {
    this.prisma = prisma;
    this.supportedTokens = supportedTokens;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server: HTTPServer): void {
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
    });

    this.wss.on("connection", (ws: WebSocket, req) => {
      logger.info("WebSocket client connected");

      const subscription: ClientSubscription = {
        ws,
        subscriptions: new Set(),
      };
      this.clients.set(ws, subscription);

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: "connected",
          message: "WebSocket connection established",
        })
      );

      // Handle messages from client
      ws.on("message", (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          logger.error({ error }, "Error parsing WebSocket message");
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            })
          );
        }
      });

      // Handle client disconnect
      ws.on("close", () => {
        logger.info("WebSocket client disconnected");
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on("error", (error) => {
        logger.error({ error }, "WebSocket error");
        this.clients.delete(ws);
      });
    });

    // Start price update loop
    this.startPriceUpdates();
    // Start trade update loop
    this.startTradeUpdates();

    logger.info("WebSocket server initialized");
  }

  /**
   * Handle messages from clients
   */
  private handleClientMessage(ws: WebSocket, data: any): void {
    const subscription = this.clients.get(ws);
    if (!subscription) return;

    switch (data.type) {
      case "subscribe":
        if (data.channels && Array.isArray(data.channels)) {
          data.channels.forEach((channel: string) => {
            subscription.subscriptions.add(channel);
          });
          ws.send(
            JSON.stringify({
              type: "subscribed",
              channels: Array.from(subscription.subscriptions),
            })
          );
        }
        break;

      case "unsubscribe":
        if (data.channels && Array.isArray(data.channels)) {
          data.channels.forEach((channel: string) => {
            subscription.subscriptions.delete(channel);
          });
          ws.send(
            JSON.stringify({
              type: "unsubscribed",
              channels: Array.from(subscription.subscriptions),
            })
          );
        }
        break;

      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;

      default:
        ws.send(
          JSON.stringify({
            type: "error",
            message: `Unknown message type: ${data.type}`,
          })
        );
    }
  }

  /**
   * Start price update loop - fetches prices and broadcasts to subscribers
   */
  private startPriceUpdates(): void {
    // Update prices every 45 seconds to avoid rate limiting and reduce API load
    const PRICE_INTERVAL_MS = 45_000;
    this.priceUpdateInterval = setInterval(async () => {
      if (this.supportedTokens.length === 0) return;

      // Process tokens sequentially with delay to avoid rate limits
      for (const tokenMint of this.supportedTokens) {
        try {
          // Fetch price using Jupiter quote API
          const quote = await fetchJupiterQuote(
            {
              inputMint: USDC_MINT,
              outputMint: tokenMint,
              amount: 1_000_000, // 1 USDC (6 decimals)
              slippageBps: 50,
            },
            { apiKey: process.env.JUPITER_API_KEY }
          );

          // Calculate price (tokenized stocks use 8 decimals)
          // outAmount is in token's native decimals, so divide by 10^8
          const price = Number(quote.outAmount) / 1e8;
          const previousPrice = this.priceCache.get(tokenMint)?.price || price;
          const change = price - previousPrice;
          const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

          const update: PriceUpdate = {
            mint: tokenMint,
            price,
            change,
            changePercent,
            timestamp: Date.now(),
          };

          this.priceCache.set(tokenMint, update);

          // Broadcast to all clients subscribed to prices
          this.broadcast("price:update", update);

          // Small delay between requests to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          logger.error({ error, tokenMint }, "Error fetching price");
          // Continue with next token even if one fails
        }
      }
    }, PRICE_INTERVAL_MS);
  }

  /**
   * Start trade update loop - fetches recent trades and broadcasts
   */
  private startTradeUpdates(): void {
    // Update trades every 3 seconds
    this.tradeUpdateInterval = setInterval(async () => {
      try {
        const recentTrades = await this.prisma.trade.findMany({
          where: {
            status: "EXECUTED",
          },
          orderBy: {
            executedAt: "desc",
          },
          take: 10,
          select: {
            id: true,
            direction: true,
            inputTokenMint: true,
            inputAmount: true,
            outputTokenMint: true,
            outputAmount: true,
            priceUsd: true,
            executedAt: true,
          },
        });

        const tradeUpdates: TradeUpdate[] = recentTrades.map((trade) => ({
          id: trade.id,
          direction: trade.direction as "BUY" | "SELL",
          inputTokenMint: trade.inputTokenMint,
          outputTokenMint: trade.outputTokenMint,
          inputAmount: trade.inputAmount.toString(),
          outputAmount: trade.outputAmount.toString(),
          priceUsd: trade.priceUsd?.toString() || null,
          executedAt: trade.executedAt?.toISOString() || new Date().toISOString(),
        }));

        // Broadcast to all clients subscribed to trades
        this.broadcast("trade:executed", tradeUpdates);
      } catch (error) {
        logger.error({ error }, "Error fetching recent trades");
      }
    }, 3000); // Update every 3 seconds
  }

  /**
   * Broadcast message to all subscribed clients
   */
  private broadcast(event: string, data: any): void {
    const message = JSON.stringify({
      type: event,
      data,
      timestamp: Date.now(),
    });

    this.clients.forEach((subscription, ws) => {
      if (
        ws.readyState === WebSocket.OPEN &&
        subscription.subscriptions.has(event.split(":")[0])
      ) {
        try {
          ws.send(message);
        } catch (error) {
          logger.error({ error }, "Error sending WebSocket message");
          this.clients.delete(ws);
        }
      }
    });
  }

  /**
   * Broadcast order update to specific user
   */
  broadcastOrderUpdate(userId: string, orderData: any): void {
    const message = JSON.stringify({
      type: "order:update",
      data: orderData,
      timestamp: Date.now(),
    });

    this.clients.forEach((subscription, ws) => {
      if (
        ws.readyState === WebSocket.OPEN &&
        subscription.userId === userId &&
        subscription.subscriptions.has("orders")
      ) {
        try {
          ws.send(message);
        } catch (error) {
          logger.error({ error }, "Error sending order update");
        }
      }
    });
  }

  /**
   * Get current price cache
   */
  getPriceCache(): Map<string, PriceUpdate> {
    return this.priceCache;
  }

  /**
   * Cleanup - stop intervals and close connections
   */
  cleanup(): void {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    if (this.tradeUpdateInterval) {
      clearInterval(this.tradeUpdateInterval);
    }
    this.clients.forEach((subscription) => {
      subscription.ws.close();
    });
    this.clients.clear();
    if (this.wss) {
      this.wss.close();
    }
  }
}

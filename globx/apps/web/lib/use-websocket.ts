"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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

type WebSocketEvent = "price:update" | "trade:executed" | "order:update";

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: number;
}

interface UseWebSocketOptions {
  channels?: string[]; // ['prices', 'trades', 'orders']
  onPriceUpdate?: (update: PriceUpdate) => void;
  onTradeUpdate?: (trades: TradeUpdate[]) => void;
  onOrderUpdate?: (order: any) => void;
  enabled?: boolean;
}

interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    channels = [],
    onPriceUpdate,
    onTradeUpdate,
    onOrderUpdate,
    enabled = true,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const maxReconnectAttempts = 3;
  const reconnectDelays = [1000, 2000, 4000, 8000]; // Exponential backoff
  
  // Use refs for callbacks to prevent infinite loops
  const onPriceUpdateRef = useRef(onPriceUpdate);
  const onTradeUpdateRef = useRef(onTradeUpdate);
  const onOrderUpdateRef = useRef(onOrderUpdate);
  const channelsRef = useRef(channels);
  const enabledRef = useRef(enabled);

  // Update refs when callbacks change
  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
    onTradeUpdateRef.current = onTradeUpdate;
    onOrderUpdateRef.current = onOrderUpdate;
    channelsRef.current = channels;
    enabledRef.current = enabled;
  }, [onPriceUpdate, onTradeUpdate, onOrderUpdate, channels, enabled]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";
  // Convert http://localhost:3030 to ws://localhost:3030/ws
  const wsUrl = API_BASE_URL.replace(/^http/, "ws") + "/ws";

  const connect = useCallback(() => {
    if (!enabledRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING || isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;
    setState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      // Only connect if WebSocket is supported
      if (typeof WebSocket === "undefined") {
        console.warn("WebSocket not supported, falling back to HTTP polling");
        setState({
          connected: false,
          connecting: false,
          error: new Error("WebSocket not supported"),
        });
        return;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        isConnectingRef.current = false;
        setState({
          connected: true,
          connecting: false,
          error: null,
        });
        reconnectAttemptsRef.current = 0;

        // Subscribe to channels
        if (channelsRef.current.length > 0) {
          ws.send(
            JSON.stringify({
              type: "subscribe",
              channels: channelsRef.current,
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case "connected":
              // WebSocket connection established
              break;

            case "subscribed":
              // Successfully subscribed to channels
              break;

            case "price:update":
              if (onPriceUpdateRef.current && message.data) {
                onPriceUpdateRef.current(message.data as PriceUpdate);
              }
              break;

            case "trade:executed":
              if (onTradeUpdateRef.current && message.data) {
                onTradeUpdateRef.current(message.data as TradeUpdate[]);
              }
              break;

            case "order:update":
              if (onOrderUpdateRef.current && message.data) {
                onOrderUpdateRef.current(message.data);
              }
              break;

            case "pong":
              // Heartbeat response
              break;

            case "error":
              console.error("WebSocket error:", message.message);
              setState((prev) => ({
                ...prev,
                error: new Error(message.message || "WebSocket error"),
              }));
              break;

            default:
              console.log("Unknown WebSocket message:", message.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        // Suppress error logging - WebSocket errors are expected when server is down
        // The onclose handler will handle reconnection logic
        isConnectingRef.current = false;
        setState((prev) => ({
          ...prev,
          connecting: false,
        }));
      };

      ws.onclose = (event) => {
        isConnectingRef.current = false;
        // Only log if it's an unexpected closure
        if (event.code !== 1000) {
          console.log("WebSocket closed", event.code, event.reason);
        }
        setState((prev) => ({
          ...prev,
          connected: false,
          connecting: false,
        }));

        // Attempt reconnection if not a normal closure and enabled
        if (event.code !== 1000 && enabledRef.current && event.code !== 1006) {
          const attempt = reconnectAttemptsRef.current;
          if (attempt < maxReconnectAttempts) {
            const delay =
              reconnectDelays[Math.min(attempt, reconnectDelays.length - 1)];
            reconnectAttemptsRef.current += 1;

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            // After max attempts, silently fall back to HTTP polling
            setState((prev) => ({
              ...prev,
              error: new Error("WebSocket unavailable, using HTTP fallback"),
            }));
          }
        } else if (event.code === 1006) {
          // Abnormal closure - server might be down
          setState((prev) => ({
            ...prev,
            error: new Error("WebSocket server unavailable, using HTTP fallback"),
          }));
        }
      };
    } catch (error) {
      isConnectingRef.current = false;
      console.error("Error creating WebSocket:", error);
      setState({
        connected: false,
        connecting: false,
        error: error as Error,
      });
    }
  }, [wsUrl]);

  const disconnect = useCallback(() => {
    isConnectingRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect");
      wsRef.current = null;
    }

    setState({
      connected: false,
      connecting: false,
      error: null,
    });
  }, []);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!state.connected) return;

    const heartbeatInterval = setInterval(() => {
      send({ type: "ping" });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [state.connected, send]);

  // Connect on mount and when enabled changes
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only depend on enabled, connect/disconnect are stable

  // Resubscribe when channels change
  useEffect(() => {
    if (state.connected && channelsRef.current.length > 0) {
      send({
        type: "subscribe",
        channels: channelsRef.current,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.connected, channels]); // Only re-run when connection state or channels change

  return {
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,
    send,
    reconnect: connect,
    disconnect,
  };
}

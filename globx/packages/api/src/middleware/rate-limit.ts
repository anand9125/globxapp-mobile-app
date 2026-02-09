// Rate Limiting Middleware

import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window (more responsive)
  limit: 200, // Increased to 200 requests per minute for general API usage
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lenient rate limiter for read-only public endpoints (recent trades, etc.)
export const publicReadRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 120, // Allow 120 requests per minute for public read endpoints
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Stricter limit for sensitive endpoints
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests, please try again later.",
  },
});

// More lenient rate limiter for quote endpoints (read-only operations)
export const quoteRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 60, // Allow 60 requests per minute for quotes (increased for multiple components)
  message: {
    error: "QUOTE_RATE_LIMIT_EXCEEDED",
    message: "Too many quote requests, please wait a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

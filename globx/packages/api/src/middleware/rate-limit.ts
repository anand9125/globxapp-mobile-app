// Rate Limiting Middleware

import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message: {
        error: "TOO_MANY_REQUESTS",
        message: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes\
    max: 10, // Stricter limit for sensitive endpoints
    message: {
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later.",
    },
});


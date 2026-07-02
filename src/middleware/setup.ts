import { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

/**
 * Configure middleware stack for the Express application.
 * Sets up security, CORS, logging, rate limiting, and parsing middleware.
 */
export function setupMiddleware(app: Application): void {
  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Body parsing
  app.use(express.json({ limit: process.env.BODY_SIZE_LIMIT || "1mb" }));

  // HTTP request logging
  app.use(morgan(process.env.LOG_FORMAT || "dev"));

  // Rate limiting
  const rateLimitConfig = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "120"),
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === "/health";
    },
  };

  app.use(rateLimit(rateLimitConfig));
}

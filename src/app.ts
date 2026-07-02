import express from "express";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import investorsRoutes from "./modules/investors/investors.routes";
import walletsRoutes from "./modules/wallets/wallets.routes";
import kycRoutes from "./modules/kyc/kyc.routes";
import tokensRoutes from "./modules/tokens/tokens.routes";
import transfersRoutes from "./modules/transfers/transfers.routes";
import multisigRoutes from "./modules/multisig/multisig.routes";
import auditRoutes from "./modules/audit-logs/audit-logs.routes";
import { errorHandler } from "./middleware/error-handler";
import { setupMiddleware } from "./middleware/setup";
import { swaggerSpec } from "./config/swagger";

export const app = express();

// Configure middleware stack (security, CORS, logging, rate limiting, etc.)
setupMiddleware(app);

/**
 * Health check endpoint
 * Returns API status and service name
 */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "tokenization-permission-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Swagger/OpenAPI documentation
 */
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
    },
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

// API Routes
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/investors", investorsRoutes);
app.use("/wallets", walletsRoutes);
app.use("/kyc", kycRoutes);
app.use("/tokens", tokensRoutes);
app.use("/transfers", transfersRoutes);
app.use("/multisig", multisigRoutes);
app.use("/audit-logs", auditRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

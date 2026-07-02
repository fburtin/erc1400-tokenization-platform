/**
 * Swagger/OpenAPI specification for Tokenization Permission API
 */
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Tokenization Permission API",
    version: "1.0.0",
    description:
      "API for managing ERC-1400 security token transfers with multi-signature approval, KYC compliance, and investor portfolio management",
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        tags: ["System"],
        responses: {
          200: {
            description: "API is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: {
                      type: "string",
                      example: "tokenization-permission-api",
                    },
                    timestamp: { type: "string", format: "date-time" },
                    uptime: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "fullName", "role"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "admin@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "Password123!",
                  },
                  fullName: {
                    type: "string",
                    example: "Admin User",
                  },
                  role: {
                    type: "string",
                    enum: ["ADMIN", "COMPLIANCE", "OPERATOR", "VIEWER"],
                    example: "ADMIN",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
          },
          400: {
            description: "Invalid input or user already exists",
          },
          409: {
            description: "Email already registered",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "admin@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "Password123!",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "JWT token returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    expiresIn: { type: "number" },
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid credentials",
          },
        },
      },
    },
    "/investors": {
      get: {
        summary: "List investors",
        tags: ["Investors"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Investor list",
          },
          401: {
            description: "Missing or invalid bearer token",
          },
        },
      },
      post: {
        summary: "Create investor",
        tags: ["Investors"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "countryCode"],
                properties: {
                  name: {
                    type: "string",
                    description: "Investor legal name",
                    example: "BlackRock Capital",
                  },
                  countryCode: {
                    type: "string",
                    description: "ISO 3166-1 alpha-2 country code",
                    example: "US",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "Primary investor contact email",
                    example: "investor@example.com",
                  },
                  riskScore: {
                    type: "integer",
                    description: "Internal risk assessment score",
                    minimum: 0,
                    maximum: 100,
                    example: 10,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Investor created",
          },
          400: {
            description: "Validation failed",
          },
          401: {
            description: "Missing or invalid bearer token",
          },
          403: {
            description: "Admin role required",
          },
        },
      },
    },
    "/wallets": {
      get: {
        summary: "List wallets",
        tags: ["Wallets"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Wallet list",
          },
          401: {
            description: "Missing or invalid bearer token",
          },
        },
      },
      post: {
        summary: "Create wallet",
        tags: ["Wallets"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["investorId", "address"],
                properties: {
                  investorId: {
                    type: "string",
                    format: "uuid",
                    description: "Investor UUID",
                    example: "7009d90b-a1b0-4ae3-9c52-fb9a01a9fdd8",
                  },
                  address: {
                    type: "string",
                    description: "Blockchain wallet address (0x...)",
                    example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                  },
                  whitelisted: {
                    type: "boolean",
                    description: "ERC-1400 transfer whitelist",
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Wallet created",
          },
          400: {
            description: "Validation failed or invalid address",
          },
          401: {
            description: "Missing or invalid bearer token",
          },
          404: {
            description: "Investor not found",
          },
        },
      },
    },
    "/tokens": {
      get: {
        summary: "List tokens",
        tags: ["Tokens"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Token list",
          },
          401: {
            description: "Missing or invalid bearer token",
          },
        },
      },
      post: {
        summary: "Create token",
        tags: ["Tokens"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["symbol", "name", "totalSupply"],
                properties: {
                  symbol: {
                    type: "string",
                    example: "BPEF",
                  },
                  name: {
                    type: "string",
                    example: "BlackRock Private Equity Fund",
                  },
                  totalSupply: {
                    type: "number",
                    example: 1000000,
                  },
                  decimals: {
                    type: "integer",
                    example: 18,
                  },
                  partition: {
                    type: "string",
                    example: "CLASS_A",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Token created",
          },
          400: {
            description: "Validation failed",
          },
          401: {
            description: "Missing or invalid bearer token",
          },
          403: {
            description: "Admin role required",
          },
        },
      },
    },
    "/kyc/{investorId}/simulate-check": {
      post: {
        summary: "Simulate KYC check for investor",
        tags: ["KYC"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "investorId",
            in: "path",
            required: true,
            description: "Investor UUID",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "7009d90b-a1b0-4ae3-9c52-fb9a01a9fdd8",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["documentVerified"],
                properties: {
                  documentVerified: {
                    type: "boolean",
                    description:
                      "Whether the investor identity document was verified",
                    example: true,
                  },
                  sanctionsHit: {
                    type: "boolean",
                    description: "Whether the investor matched a sanctions list",
                    default: false,
                    example: false,
                  },
                  pep: {
                    type: "boolean",
                    description: "Politically exposed person flag",
                    default: false,
                    example: false,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "KYC decision returned",
          },
          400: {
            description: "Validation failed",
          },
          401: {
            description: "Missing or invalid bearer token",
          },
          403: {
            description: "Admin or compliance role required",
          },
          404: {
            description: "Investor not found",
          },
        },
      },
    },
    "/multisig/{id}/execute": {
      post: {
        summary: "Execute approved multisig transfer",
        tags: ["Multisig"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            example: "ad864d0e-2191-43b2-a467-4a74f6b2b5f8",
          },
        ],
        responses: {
          200: {
            description: "Transfer executed",
          },
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Admin or operator role required",
          },
          404: {
            description: "Multisig request not found",
          },
          409: {
            description: "Multisig request must be approved before execution",
          },
        },
      },
    },
    "/multisig/{id}/approvals": {
      post: {
        summary: "Approve or reject multisig request",
        tags: ["Multisig"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            example: "ad864d0e-2191-43b2-a467-4a74f6b2b5f8",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["approved"],
                properties: {
                  approved: { type: "boolean", example: true },
                  comment: {
                    type: "string",
                    maxLength: 500,
                    example: "Approved after compliance review",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Approval recorded",
          },
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Role not allowed",
          },
          404: {
            description: "Multisig request not found",
          },
          409: {
            description: "Multisig request is not pending",
          },
        },
      },
    },
    "/transfers/requests": {
      post: {
        summary: "Create transfer request with multisig approval",
        tags: ["Transfers"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tokenId", "fromInvestorId", "toInvestorId", "amount"],
                properties: {
                  tokenId: {
                    type: "string",
                    format: "uuid",
                    example: "34de7e9c-02f2-48b9-8dcc-e98603ed2a63",
                  },
                  fromInvestorId: {
                    type: "string",
                    format: "uuid",
                    example: "7009d90b-a1b0-4ae3-9c52-fb9a01a9fdd8",
                  },
                  toInvestorId: {
                    type: "string",
                    format: "uuid",
                    example: "84334ef0-1ba8-4d13-bf4c-64719c92ac71",
                  },
                  amount: {
                    type: "number",
                    minimum: 0,
                    example: 1200,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Transfer request created",
          },
          400: {
            description: "Validation failed or transfer rejected",
          },
          401: {
            description: "Missing or invalid bearer token",
          },
          403: {
            description: "Admin or operator role required",
          },
        },
      },
      get: {
        summary: "List transfer requests",
        tags: ["Transfers"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Transfer request list",
          },
          401: {
            description: "Missing or invalid bearer token",
          },
        },
      },
    },
    "/transfers/validate": {
      post: {
        summary: "Validate ERC-1400-style token transfer",
        tags: ["Transfers"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tokenId", "fromInvestorId", "toInvestorId", "amount"],
                properties: {
                  tokenId: {
                    type: "string",
                    format: "uuid",
                    description: "ERC-1400 token identifier",
                    example: "34de7e9c-02f2-48b9-8dcc-e98603ed2a63",
                  },
                  fromInvestorId: {
                    type: "string",
                    format: "uuid",
                    description: "Sender investor identifier",
                    example: "7009d90b-a1b0-4ae3-9c52-fb9a01a9fdd8",
                  },
                  toInvestorId: {
                    type: "string",
                    format: "uuid",
                    description: "Receiver investor identifier",
                    example: "84334ef0-1ba8-4d13-bf4c-64719c92ac71",
                  },
                  amount: {
                    type: "number",
                    minimum: 0,
                    description: "Token amount",
                    example: 1000,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Transfer validation result",
          },
          400: {
            description: "Transfer rejected",
          },
          401: {
            description: "Missing or invalid bearer token",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://api.example.com",
      description: "Production server",
    },
  ],
  tags: [
    { name: "System", description: "System health and info" },
    { name: "Authentication", description: "User authentication endpoints" },
    { name: "Investors", description: "Investor management" },
    { name: "Wallets", description: "Wallet management" },
    { name: "Tokens", description: "Token management" },
    { name: "KYC", description: "Know Your Customer compliance" },
    { name: "Multisig", description: "Multi-signature transaction approval" },
    { name: "Transfers", description: "Token transfer operations" },
  ],
};

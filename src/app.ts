import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
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

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Tokenization Permission API",
    version: "1.0.0"
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "API is running"
          }
        }
      }
    },
"/auth/register": {
  post: {
    summary: "Register user",
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
                example: "admin@example.com"
              },
              password: {
                type: "string",
                example: "Password123!"
              },
              fullName: {
                type: "string",
                example: "Admin User"
              },
              role: {
                type: "string",
                example: "ADMIN"
              }
            }
          }
        }
      }
    },
    responses: {
      201: {
        description: "User registered"
      }
    }
  }
},
    "/auth/login": {
  post: {
    summary: "Login user",
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
                example: "admin@example.com"
              },
              password: {
                type: "string",
                example: "Password123!"
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: "JWT token returned"
      }
    }
  }
},
"/investors": {
  get: {
    summary: "List investors",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Investor list"
      }
    }
  },
  post: {
    summary: "Create investor",
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name", "country", "accredited"],
            properties: {
  name: {
    type: "string",
    description: "Investor legal name",
    example: "BlackRock Capital"
  },
  countryCode: {
    type: "string",
    description: "ISO 3166-1 alpha-2 country code",
    example: "US"
  },
  email: {
    type: "string",
    format: "email",
    description: "Primary investor contact email",
    example: "admin@example.com"
  },
  riskScore: {
    type: "integer",
    description: "Internal risk assessment score",
    minimum: 0,
    maximum: 100,
    example: 10
  }
}
          }
        }
      }
    },
    responses: {
      201: {
        description: "Investor created"
      }
    }
  }
},
 "/wallets": {
  get: {
    summary: "List wallets",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Wallet list"
      }
    }
  },
  post: {
    summary: "Create wallet",
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
                description: "Investor UUID",
                example: "7009d90b-a1b0-4ae3-9c52-fb9a01a9fdd8"
              },
              address: {
                type: "string",
                description: "Blockchain wallet address",
                example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
              },
              whitelisted: {
                type: "boolean",
                description: "ERC-1400 transfer whitelist",
                example: true
              }
            }
          }
        }
      }
    },
    responses: {
      201: {
        description: "Wallet created"
      }
    }
  }
},
"/tokens": {
  get: {
    summary: "List tokens",
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: "Token list" }
    }
  },
  post: {
    summary: "Create token",
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
                example: "BPEF"
              },
              name: {
                type: "string",
                example: "BlackRock Private Equity Fund"
              },
              totalSupply: {
                type: "number",
                example: 1000000
              },
              decimals: {
                type: "integer",
                example: 18
              },
              partition: {
                type: "string",
                example: "CLASS_A"
              }
            }
          }
        }
      }
    },
    responses: {
      201: { description: "Token created" }
    }
  }
},
"/kyc/{investorId}/simulate-check": {
  post: {
    summary: "Simulate KYC check for investor",
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: "investorId",
        in: "path",
        required: true,
        description: "Investor UUID",
        schema: {
          type: "string",
          format: "uuid"
        },
        example: "7009d90b-a1b0-4ae3-9c52-fb9a01a9fdd8"
      }
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
                description: "Whether the investor identity document was verified",
                example: true
              },
              sanctionsHit: {
                type: "boolean",
                description: "Whether the investor matched a sanctions list",
                default: false,
                example: false
              },
              pep: {
                type: "boolean",
                description: "Politically exposed person flag",
                default: false,
                example: false
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: "KYC decision returned"
      },
      400: {
        description: "Validation failed"
      },
      401: {
        description: "Missing or invalid bearer token"
      },
      403: {
        description: "Admin or compliance role required"
      },
      404: {
        description: "Investor not found"
      }
    }
  }
},
  "/multisig/proposals": {
      post: {
        summary: "Create multisig proposal",
        responses: {
          201: { description: "Proposal created" }
        }
      }
    },
"/multisig/{id}/execute": {
  post: {
    summary: "Execute approved multisig transfer",
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        example: "ad864d0e-2191-43b2-a467-4a74f6b2b5f8"
      }
    ],
    responses: {
      200: { description: "Transfer executed" },
      401: { description: "Unauthorized" },
      403: { description: "Admin or operator role required" },
      404: { description: "Multisig request not found" },
      409: { description: "Multisig request must be approved before execution" }
    }
  }
},
"/multisig/{id}/approvals": {
  post: {
    summary: "Approve or reject multisig request",
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        example: "ad864d0e-2191-43b2-a467-4a74f6b2b5f8"
      }
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
                example: "Approved after compliance review"
              }
            }
          }
        }
      }
    },
    responses: {
      200: { description: "Approval recorded" },
      401: { description: "Unauthorized" },
      403: { description: "Role not allowed" },
      404: { description: "Multisig request not found" },
      409: { description: "Multisig request is not pending" }
    }
  }
},
"/transfers/requests": {
  post: {
    summary: "Create transfer request with multisig approval",
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
                example: "34de7e9c-02f2-48b9-8dcc-e98603ed2a63"
              },
              fromInvestorId: {
                type: "string",
                format: "uuid",
                example: "7009d90b-a1b0-4ae3-9c52-fb9a01a9fdd8"
              },
              toInvestorId: {
                type: "string",
                format: "uuid",
                example: "84334ef0-1ba8-4d13-bf4c-64719c92ac71"
              },
              amount: {
                type: "number",
                example: 1200
              }
            }
          }
        }
      }
    },
    responses: {
      201: { description: "Transfer request created" },
      400: { description: "Validation failed or transfer rejected" },
      401: { description: "Missing or invalid bearer token" },
      403: { description: "Admin or operator role required" }
    }
  },
  get: {
    summary: "List transfer requests",
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: "Transfer request list" }
    }
  }
},
	"/transfers/validate": {
	  post: {
		summary: "Validate ERC-1400-style token transfer",
		security: [{ bearerAuth: [] }],
		requestBody: {
		  required: true,
		  content: {
			"application/json": {
			  schema: {
				type: "object",
				required: [
				  "tokenId",
				  "fromInvestorId",
				  "toInvestorId",
				  "amount"
				],
				properties: {
				  tokenId: {
					type: "string",
					format: "uuid",
					description: "ERC-1400 token identifier",
					example: "34de7e9c-02f2-48b9-8dcc-e98603ed2a63"
				  },
				  fromInvestorId: {
					type: "string",
					format: "uuid",
					description: "Sender investor identifier",
					example: "7009d90b-a1b0-4ae3-9c52-fb9a01a9fdd8"
				  },
				  toInvestorId: {
					type: "string",
					format: "uuid",
					description: "Receiver investor identifier",
					example: "84334ef0-1ba8-4d13-bf4c-64719c92ac71"
				  },
				  amount: {
					type: "number",
					minimum: 0,
					description: "Token amount",
					example: 1000
				  }
				}
			  }
			}
		  }
		},
		responses: {
		  200: {
			description: "Transfer validation result"
		  },
		  400: {
			description: "Transfer rejected"
		  }
		}
	  }
	},
	
  
	
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};

app.get("/health", (_req, res) => res.json({ status: "ok", service: "tokenization-permission-api" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/investors", investorsRoutes);
app.use("/wallets", walletsRoutes);
app.use("/kyc", kycRoutes);
app.use("/tokens", tokensRoutes);
app.use("/transfers", transfersRoutes);
app.use("/multisig", multisigRoutes);
app.use("/audit-logs", auditRoutes);
app.use(errorHandler);

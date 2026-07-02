# Tokenization Permission API

A professional Node.js + TypeScript backend API inspired by financial/tokenization infrastructure roles.

It demonstrates:

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication and role-based authorization
- Investors and wallet whitelisting
- Mock KYC checks
- ERC-1400-style transfer restrictions
- Token partitions / lockups / country restrictions
- Multisig approval workflow
- Docker Compose setup
- Unit tests with Vitest
- Swagger UI endpoint

## Architecture

```text
src/
  modules/
    auth/          register/login/JWT
    users/         current user and admin listing
    investors/     investor onboarding and KYC state
    wallets/       wallet registration, whitelist/block flags
    kyc/           mock KYC provider integration
    tokens/        ERC-1400-style token and partition config
    transfers/     transfer validation and request creation
    multisig/      approvals and execution workflow
    audit-logs/    audit-log endpoint placeholder
```

## Quick start

```bash
cp .env.example .env
npm install
npx prisma generate
npm run docker:up
```

Or run Postgres with Docker and API locally:

```bash
docker compose up -d postgres
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

API: `http://localhost:3000`

Swagger UI: `http://localhost:3000/docs`

Health check:

```bash
curl http://localhost:3000/health
```

## Default seed login

```text
email: admin@example.com
password: Password123!
```

## Example workflow

### 1. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'
```

Copy the returned JWT token.

### 2. List investors

```bash
curl http://localhost:3000/investors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Validate a transfer

Use the seeded `alice`, `bob`, and `token` IDs printed by `npx prisma db seed`.

```bash
curl -X POST http://localhost:3000/transfers/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tokenId":"TOKEN_ID",
    "fromInvestorId":"ALICE_ID",
    "toInvestorId":"BOB_ID",
    "amount":100
  }'
```

Expected response:

```json
{
  "allowed": true,
  "code": "A0",
  "reason": "Transfer allowed by ERC-1400-style permission policy"
}
```

### 4. Create transfer request

```bash
curl -X POST http://localhost:3000/transfers/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tokenId":"TOKEN_ID",
    "fromInvestorId":"ALICE_ID",
    "toInvestorId":"BOB_ID",
    "amount":100
  }'
```

This creates a pending transfer plus a multisig request requiring 2 approvals.

## Policy rules implemented

The transfer validation service rejects a transaction when:

- amount is zero or negative
- token is paused
- sender KYC is not approved
- receiver KYC is not approved
- sender has no active whitelisted wallet
- receiver has no active whitelisted wallet
- investor risk score is too high
- token partition is locked
- receiver country is not allowed
- receiver country is blocked

## Why this matches a Tether-style backend role

This project is not a production blockchain system, but it demonstrates backend engineering concepts relevant to digital asset infrastructure:

- permissioned transfer flows
- operational controls
- compliance-state modeling
- financial API design
- tokenization primitives
- multisig-style approvals
- distributed-systems friendly module boundaries

## Next improvements

Good GitHub roadmap items:

- Add real blockchain listener with ethers.js
- Add ERC-1400 smart contract integration
- Add OpenTelemetry tracing
- Add Redis queue for async transaction processing
- Add real audit-log middleware
- Add API pagination and filtering
- Add integration tests with Testcontainers

Repository now contains:

Authentication with JWT
Investors
Wallet whitelisting
ERC-1400 token model
Transfer policy validation
KYC simulation
Transfer requests
Multisig approvals
Multisig execution
Prisma migrations
Docker support

Flow diagram such as:

Investor -> KYC -> Wallet Whitelist
                  ↓
Token Creation (ERC1400)
                  ↓
Transfer Validation
                  ↓
Transfer Request
                  ↓
Multisig Approval (2 of N)
                  ↓
Execute Transfer
import { describe, expect, it } from "vitest";
import { KycStatus, TokenType } from "@prisma/client";
import { validateTransferPolicy } from "../src/modules/transfers/transfer-policy";

const base = {
  token: { id: "t", symbol: "RWA", name: "RWA", tokenType: TokenType.ERC1400, contractAddress: null, chain: "ethereum", totalSupply: 0 as any, paused: false, requiresKyc: true, createdAt: new Date(), updatedAt: new Date() },
  fromInvestor: { id: "a", name: "Alice", countryCode: "AR", email: null, kycStatus: KycStatus.APPROVED, riskScore: 10, createdAt: new Date(), updatedAt: new Date(), wallets: [{ id: "w1", address: "0x1", chain: "ethereum", whitelisted: true, blocked: false, investorId: "a", createdAt: new Date(), updatedAt: new Date() }] },
  toInvestor: { id: "b", name: "Bob", countryCode: "US", email: null, kycStatus: KycStatus.APPROVED, riskScore: 10, createdAt: new Date(), updatedAt: new Date(), wallets: [{ id: "w2", address: "0x2", chain: "ethereum", whitelisted: true, blocked: false, investorId: "b", createdAt: new Date(), updatedAt: new Date() }] },
  amount: 100
};

describe("validateTransferPolicy", () => {
  it("allows approved KYC investors with whitelisted wallets", () => {
    expect(validateTransferPolicy(base).allowed).toBe(true);
  });

  it("rejects receiver without KYC", () => {
    const result = validateTransferPolicy({ ...base, toInvestor: { ...base.toInvestor, kycStatus: KycStatus.PENDING } });
    expect(result.allowed).toBe(false);
    expect(result.code).toBe("K2");
  });
});

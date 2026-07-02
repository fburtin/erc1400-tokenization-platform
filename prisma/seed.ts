import bcrypt from "bcryptjs";
import { KycStatus, Role, TokenType } from "@prisma/client";
import { prisma } from "../src/config/prisma";

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      fullName: "Admin User",
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash("Password123!", 12)
    }
  });

  const alice = await prisma.investor.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { name: "Alice Investor", email: "alice@example.com", countryCode: "AR", kycStatus: KycStatus.APPROVED, riskScore: 10 }
  });

  const bob = await prisma.investor.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { name: "Bob Investor", email: "bob@example.com", countryCode: "US", kycStatus: KycStatus.APPROVED, riskScore: 15 }
  });

  await prisma.wallet.upsert({
    where: { address: "0x1111111111111111111111111111111111111111" },
    update: {},
    create: { investorId: alice.id, address: "0x1111111111111111111111111111111111111111", chain: "ethereum", whitelisted: true }
  });

  await prisma.wallet.upsert({
    where: { address: "0x2222222222222222222222222222222222222222" },
    update: {},
    create: { investorId: bob.id, address: "0x2222222222222222222222222222222222222222", chain: "ethereum", whitelisted: true }
  });

  const token = await prisma.token.upsert({
    where: { symbol: "RWA" },
    update: {},
    create: { symbol: "RWA", name: "Real World Asset Token", tokenType: TokenType.ERC1400, chain: "ethereum", requiresKyc: true }
  });

  await prisma.tokenPartition.upsert({
    where: { tokenId_name: { tokenId: token.id, name: "unrestricted" } },
    update: {},
    create: { tokenId: token.id, name: "unrestricted", allowedCountries: [], blockedCountries: [] }
  });

  console.log({ admin: admin.email, password: "Password123!", alice: alice.id, bob: bob.id, token: token.id });
}

main().finally(() => prisma.$disconnect());

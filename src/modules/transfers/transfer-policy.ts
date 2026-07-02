import { Investor, KycStatus, Token, TokenPartition, Wallet } from "@prisma/client";

export type TransferValidationInput = {
  token: Token;
  partition?: TokenPartition | null;
  fromInvestor: Investor & { wallets: Wallet[] };
  toInvestor: Investor & { wallets: Wallet[] };
  amount: number;
};

export type TransferValidationResult = {
  allowed: boolean;
  code: string;
  reason: string;
};

export function validateTransferPolicy(input: TransferValidationInput): TransferValidationResult {
  const { token, partition, fromInvestor, toInvestor, amount } = input;

  if (amount <= 0) return { allowed: false, code: "A1", reason: "Amount must be greater than zero" };
  if (token.paused) return { allowed: false, code: "A2", reason: "Token is paused" };

  if (token.requiresKyc) {
    if (fromInvestor.kycStatus !== KycStatus.APPROVED) return { allowed: false, code: "K1", reason: "Sender KYC is not approved" };
    if (toInvestor.kycStatus !== KycStatus.APPROVED) return { allowed: false, code: "K2", reason: "Receiver KYC is not approved" };
  }

  const fromWalletOk = fromInvestor.wallets.some(w => w.whitelisted && !w.blocked);
  const toWalletOk = toInvestor.wallets.some(w => w.whitelisted && !w.blocked);
  if (!fromWalletOk) return { allowed: false, code: "W1", reason: "Sender has no active whitelisted wallet" };
  if (!toWalletOk) return { allowed: false, code: "W2", reason: "Receiver has no active whitelisted wallet" };

  if (fromInvestor.riskScore >= 80 || toInvestor.riskScore >= 80) {
    return { allowed: false, code: "R1", reason: "Risk score exceeds policy threshold" };
  }

  if (partition) {
    const now = new Date();
    if (partition.lockupUntil && partition.lockupUntil > now) {
      return { allowed: false, code: "P1", reason: "Partition is still in lock-up period" };
    }

    if (partition.allowedCountries.length > 0 && !partition.allowedCountries.includes(toInvestor.countryCode)) {
      return { allowed: false, code: "P2", reason: "Receiver country is not allowed for this partition" };
    }

    if (partition.blockedCountries.includes(toInvestor.countryCode)) {
      return { allowed: false, code: "P3", reason: "Receiver country is blocked for this partition" };
    }
  }

  return { allowed: true, code: "A0", reason: "Transfer allowed by ERC-1400-style permission policy" };
}

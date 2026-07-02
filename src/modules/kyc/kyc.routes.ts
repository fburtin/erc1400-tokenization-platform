import { Router } from "express";
import { KycStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../common/async-handler";
import { validate } from "../../common/validate";
import { authenticate, requireRole } from "../../middleware/auth";

const router = Router();

const simulateSchema = z.object({
  params: z.object({ investorId: z.string().uuid() }),
  body: z.object({ documentVerified: z.boolean(), sanctionsHit: z.boolean().default(false), pep: z.boolean().default(false) })
});

router.use(authenticate);

router.post("/:investorId/simulate-check", requireRole(Role.ADMIN, Role.COMPLIANCE), validate(simulateSchema), asyncHandler(async (req, res) => {
  const riskScore = (req.body.sanctionsHit ? 90 : 0) + (req.body.pep ? 35 : 0) + (!req.body.documentVerified ? 30 : 0);
  const kycStatus = req.body.documentVerified && !req.body.sanctionsHit && riskScore < 80 ? KycStatus.APPROVED : KycStatus.REJECTED;

  const investor = await prisma.investor.update({
    where: { id: req.params.investorId },
    data: { kycStatus, riskScore: Math.min(riskScore, 100) }
  });

  res.json({ investor, provider: "mock-kyc-provider", decision: kycStatus });
}));

export default router;

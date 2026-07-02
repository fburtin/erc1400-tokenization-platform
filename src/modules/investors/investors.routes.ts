import { Router } from "express";
import { KycStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { validate } from "../../common/validate";
import { asyncHandler } from "../../common/async-handler";
import { authenticate, requireRole } from "../../middleware/auth";

const router = Router();

const createInvestorSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    countryCode: z.string().length(2).transform(x => x.toUpperCase()),
    email: z.string().email().optional(),
    riskScore: z.number().int().min(0).max(100).default(0)
  })
});

const updateKycSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ kycStatus: z.nativeEnum(KycStatus), riskScore: z.number().int().min(0).max(100).optional() })
});

router.use(authenticate);

router.post(
  "/",
  requireRole(Role.ADMIN, Role.COMPLIANCE, Role.OPERATOR),
  validate(createInvestorSchema),
  asyncHandler(async (req, res) => {
    const investor = await prisma.investor.create({ data: req.body });
    res.status(201).json(investor);
  })
);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const investors = await prisma.investor.findMany({ include: { wallets: true }, orderBy: { createdAt: "desc" } });
    res.json(investors);
  })
);

router.patch(
  "/:id/kyc",
  requireRole(Role.ADMIN, Role.COMPLIANCE),
  validate(updateKycSchema),
  asyncHandler(async (req, res) => {
    const investor = await prisma.investor.update({ where: { id: req.params.id }, data: req.body });
    res.json(investor);
  })
);

export default router;

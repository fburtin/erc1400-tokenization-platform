import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { validate } from "../../common/validate";
import { asyncHandler } from "../../common/async-handler";
import { authenticate, requireRole } from "../../middleware/auth";

const router = Router();
const ethAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address");

const createWalletSchema = z.object({
  body: z.object({
    investorId: z.string().uuid(),
    address: ethAddress.transform(x => x.toLowerCase()),
    chain: z.string().min(2).default("ethereum"),
    whitelisted: z.boolean().default(false)
  })
});

const statusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ whitelisted: z.boolean().optional(), blocked: z.boolean().optional() })
});

router.use(authenticate);

router.post("/", requireRole(Role.ADMIN, Role.COMPLIANCE, Role.OPERATOR), validate(createWalletSchema), asyncHandler(async (req, res) => {
  const wallet = await prisma.wallet.create({ data: req.body });
  res.status(201).json(wallet);
}));

router.patch("/:id/status", requireRole(Role.ADMIN, Role.COMPLIANCE), validate(statusSchema), asyncHandler(async (req, res) => {
  const wallet = await prisma.wallet.update({ where: { id: req.params.id }, data: req.body });
  res.json(wallet);
}));

export default router;

import { Router } from "express";
import { Role, TokenType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { validate } from "../../common/validate";
import { asyncHandler } from "../../common/async-handler";
import { authenticate, requireRole } from "../../middleware/auth";

const router = Router();

const createTokenSchema = z.object({ body: z.object({
  symbol: z.string().min(2).max(12).transform(x => x.toUpperCase()),
  name: z.string().min(2),
  tokenType: z.nativeEnum(TokenType).default(TokenType.ERC1400),
  contractAddress: z.string().optional(),
  chain: z.string().default("ethereum"),
  requiresKyc: z.boolean().default(true)
})});

const createPartitionSchema = z.object({
  params: z.object({ tokenId: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2),
    lockupUntil: z.coerce.date().optional(),
    allowedCountries: z.array(z.string().length(2).transform(x => x.toUpperCase())).default([]),
    blockedCountries: z.array(z.string().length(2).transform(x => x.toUpperCase())).default([])
  })
});

router.use(authenticate);

router.post("/", requireRole(Role.ADMIN, Role.OPERATOR), validate(createTokenSchema), asyncHandler(async (req, res) => {
  const token = await prisma.token.create({ data: req.body });
  res.status(201).json(token);
}));

router.get("/", asyncHandler(async (_req, res) => {
  res.json(await prisma.token.findMany({ include: { partitions: true } }));
}));

router.post("/:tokenId/partitions", requireRole(Role.ADMIN, Role.COMPLIANCE), validate(createPartitionSchema), asyncHandler(async (req, res) => {
  const partition = await prisma.tokenPartition.create({ data: { ...req.body, tokenId: req.params.tokenId } });
  res.status(201).json(partition);
}));

export default router;

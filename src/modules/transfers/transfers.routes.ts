import { Router } from "express";
import { Role, TransferStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { validate } from "../../common/validate";
import { asyncHandler } from "../../common/async-handler";
import { HttpError } from "../../common/http-error";
import { authenticate, requireRole } from "../../middleware/auth";
import { validateTransferPolicy } from "./transfer-policy";

const router = Router();

const validateTransferSchema = z.object({ body: z.object({
  tokenId: z.string().uuid(),
  partitionId: z.string().uuid().optional(),
  fromInvestorId: z.string().uuid(),
  toInvestorId: z.string().uuid(),
  amount: z.number().positive()
})});

async function loadTransferContext(body: any) {
  const [token, partition, fromInvestor, toInvestor] = await Promise.all([
    prisma.token.findUnique({ where: { id: body.tokenId } }),
    body.partitionId ? prisma.tokenPartition.findUnique({ where: { id: body.partitionId } }) : Promise.resolve(null),
    prisma.investor.findUnique({ where: { id: body.fromInvestorId }, include: { wallets: true } }),
    prisma.investor.findUnique({ where: { id: body.toInvestorId }, include: { wallets: true } })
  ]);

  if (!token) throw new HttpError(404, "Token not found");
  if (body.partitionId && !partition) throw new HttpError(404, "Partition not found");
  if (!fromInvestor) throw new HttpError(404, "Sender investor not found");
  if (!toInvestor) throw new HttpError(404, "Receiver investor not found");

  return { token, partition, fromInvestor, toInvestor };
}

router.use(authenticate);

router.post("/validate", validate(validateTransferSchema), asyncHandler(async (req, res) => {
  const ctx = await loadTransferContext(req.body);
  const result = validateTransferPolicy({ ...ctx, amount: req.body.amount });
  res.json(result);
}));

router.post("/requests", requireRole(Role.ADMIN, Role.OPERATOR), validate(validateTransferSchema), asyncHandler(async (req, res) => {
  const ctx = await loadTransferContext(req.body);
  const result = validateTransferPolicy({ ...ctx, amount: req.body.amount });

  const request = await prisma.transferRequest.create({
    data: {
      tokenId: req.body.tokenId,
      partitionId: req.body.partitionId,
      fromInvestorId: req.body.fromInvestorId,
      toInvestorId: req.body.toInvestorId,
      amount: req.body.amount,
      status: result.allowed ? TransferStatus.PENDING : TransferStatus.REJECTED,
      validationCode: result.code,
      rejectionReason: result.allowed ? null : result.reason,
      multisig: result.allowed ? { create: { requiredApprovals: 2 } } : undefined
    },
    include: { multisig: true }
  });

  res.status(201).json({ request, validation: result });
}));

router.get("/requests", asyncHandler(async (_req, res) => {
  const requests = await prisma.transferRequest.findMany({
    include: { token: true, fromInvestor: true, toInvestor: true, multisig: { include: { approvals: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json(requests);
}));

export default router;

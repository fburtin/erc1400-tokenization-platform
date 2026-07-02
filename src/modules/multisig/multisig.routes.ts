import { Router } from "express";
import { MultisigStatus, Role, TransferStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { validate } from "../../common/validate";
import { asyncHandler } from "../../common/async-handler";
import { HttpError } from "../../common/http-error";
import { authenticate, requireRole } from "../../middleware/auth";

const router = Router();

const approvalSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ approved: z.boolean(), comment: z.string().max(500).optional() })
});

router.use(authenticate);

router.post("/:id/approvals", requireRole(Role.ADMIN, Role.COMPLIANCE, Role.OPERATOR), validate(approvalSchema), asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");

  const multisig = await prisma.multisigRequest.findUnique({ where: { id: req.params.id }, include: { approvals: true } });
  if (!multisig) throw new HttpError(404, "Multisig request not found");
  if (multisig.status !== MultisigStatus.PENDING) throw new HttpError(409, "Multisig request is not pending");

  await prisma.multisigApproval.upsert({
    where: { multisigRequestId_userId: { multisigRequestId: req.params.id, userId: req.user.id } },
    create: { multisigRequestId: req.params.id, userId: req.user.id, approved: req.body.approved, comment: req.body.comment },
    update: { approved: req.body.approved, comment: req.body.comment }
  });

  const approvals = await prisma.multisigApproval.findMany({ where: { multisigRequestId: req.params.id } });
  const rejected = approvals.some(a => !a.approved);
  const approvedCount = approvals.filter(a => a.approved).length;

  let status = MultisigStatus.PENDING;
  let transferStatus = TransferStatus.PENDING;

  if (rejected) {
    status = MultisigStatus.REJECTED;
    transferStatus = TransferStatus.REJECTED;
  } else if (approvedCount >= multisig.requiredApprovals) {
    status = MultisigStatus.APPROVED;
    transferStatus = TransferStatus.APPROVED;
  }

  const updated = await prisma.multisigRequest.update({
    where: { id: req.params.id },
    data: { status, transferRequest: { update: { status: transferStatus } } },
    include: { approvals: true, transferRequest: true }
  });

  res.json(updated);
}));

router.post("/:id/execute", requireRole(Role.ADMIN, Role.OPERATOR), asyncHandler(async (req, res) => {
  const multisig = await prisma.multisigRequest.findUnique({ where: { id: req.params.id }, include: { transferRequest: true } });
  if (!multisig) throw new HttpError(404, "Multisig request not found");
  if (multisig.status !== MultisigStatus.APPROVED) throw new HttpError(409, "Multisig request must be approved before execution");

  const updated = await prisma.multisigRequest.update({
    where: { id: req.params.id },
    data: {
      status: MultisigStatus.EXECUTED,
      transferRequest: { update: { status: TransferStatus.EXECUTED } }
    },
    include: { transferRequest: true }
  });

  res.json(updated);
}));

export default router;

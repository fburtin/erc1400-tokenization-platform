import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../common/async-handler";
import { authenticate, requireRole } from "../../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", requireRole(Role.ADMIN, Role.COMPLIANCE), asyncHandler(async (_req, res) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  res.json(logs);
}));

export default router;

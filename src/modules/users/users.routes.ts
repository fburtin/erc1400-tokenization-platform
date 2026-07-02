import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../common/async-handler";
import { authenticate, requireRole } from "../../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/me", asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, fullName: true, role: true } });
  res.json(user);
}));

router.get("/", requireRole(Role.ADMIN), asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, fullName: true, role: true, createdAt: true } });
  res.json(users);
}));

export default router;

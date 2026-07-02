import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { validate } from "../../common/validate";
import { asyncHandler } from "../../common/async-handler";
import { HttpError } from "../../common/http-error";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(2),
    role: z.nativeEnum(Role).default(Role.VIEWER)
  })
});

const loginSchema = z.object({ body: z.object({ email: z.string().email(), password: z.string().min(1) }) });

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, fullName, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash, fullName, role } });
    res.status(201).json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });
  })
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
  })
);

export default router;

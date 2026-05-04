import argon2 from "argon2";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { HttpError } from "../../lib/http-error.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = loginSchema.extend({
  role: z.nativeEnum(Role).default(Role.PATIENT)
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        role: input.role,
        passwordHash: await argon2.hash(input.password)
      }
    });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.isActive || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new HttpError(401, "Invalid credentials");
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: "15m" });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  })
);

export default router;


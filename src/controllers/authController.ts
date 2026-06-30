import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { Role } from "../generated/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

const generateToken = (user: { id: number; email: string; role: string }) => {
  return jwt.sign(user, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, role, specialization, shift } = req.body;

    if (!fullName || !email || !password || !role) {
      res.status(400).json({ message: "fullName, email, password and role are required" });
      return;
    }

    const allowedRoles = [Role.SUPER_ADMIN, Role.ADMIN, Role.RECEPTIONIST, Role.TRAINER];

    if (!allowedRoles.includes(role)) {
      res.status(400).json({ message: "Invalid staff role" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone: phone || null,
        role,
        trainer:
          role === Role.TRAINER
            ? {
                create: {
                  specialization: specialization || null,
                },
              }
            : undefined,
        receptionist:
          role === Role.RECEPTIONIST
            ? {
                create: {
                  shift: shift || null,
                },
              }
            : undefined,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        trainer: true,
        receptionist: true,
      },
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

export const signupMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: "fullName, email and password are required" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await prisma.member.create({
      data: {
        status: "ACTIVE",
        user: {
          create: {
            fullName,
            email,
            phone: phone || null,
            password: hashedPassword,
            role: Role.MEMBER,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({ message: "Member signup successful", member });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to get profile", error });
  }
};
export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        message: "Current password and new password are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        message: "New password must be at least 6 characters",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change password",
      error,
    });
  }
};

export const resetUserPassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const { newPassword } = req.body;

    if (!userId || Number.isNaN(userId)) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({
        message: "New password must be at least 6 characters",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "User password reset successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reset user password",
      error,
    });
  }
};
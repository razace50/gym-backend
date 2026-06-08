import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

export const getTrainers = async (req: AuthRequest, res: Response) => {
  try {
    const trainers = await prisma.trainer.findMany({
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
        members: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.json(trainers);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get trainers", error });
  }
};

export const createTrainer = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, password, phone, specialization } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trainer = await prisma.trainer.create({
      data: {
        specialization,
        user: {
          create: {
            fullName,
            email,
            phone,
            password: hashedPassword,
            role: Role.TRAINER,
          },
        },
      },
      include: {
        user: true,
      },
    });

    return res.status(201).json(trainer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create trainer", error });
  }
};
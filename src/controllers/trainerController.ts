import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Role } from "../generated/prisma";

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
    return res.status(500).json({
      message: "Failed to get trainers",
      error,
    });
  }
};

export const createTrainer = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, password, phone, specialization } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "fullName, email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trainer = await prisma.trainer.create({
      data: {
        specialization: specialization || null,
        user: {
          create: {
            fullName,
            email,
            phone: phone || null,
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
    return res.status(500).json({
      message: "Failed to create trainer",
      error,
    });
  }
};

export const updateTrainer = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { fullName, email, phone, specialization } = req.body;

    const existingTrainer = await prisma.trainer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingTrainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    const trainer = await prisma.trainer.update({
      where: { id },
      data: {
        specialization: specialization || null,
        user: {
          update: {
            fullName,
            email,
            phone: phone || null,
          },
        },
      },
      include: {
        user: true,
      },
    });

    return res.json(trainer);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update trainer",
      error,
    });
  }
};

export const deleteTrainer = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const trainer = await prisma.trainer.findUnique({
      where: { id },
    });

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    await prisma.member.updateMany({
      where: { trainerId: id },
      data: { trainerId: null },
    });

    await prisma.trainer.delete({
      where: { id },
    });

    await prisma.user.delete({
      where: { id: trainer.userId },
    });

    return res.json({
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete trainer",
      error,
    });
  }
};
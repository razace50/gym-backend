import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getWorkoutPlans = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    let where: any = {};

    if (role === "TRAINER") {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer) {
        return res.status(404).json({ message: "Trainer profile not found" });
      }

      where.trainerId = trainer.id;
    }

    if (role === "MEMBER") {
      const member = await prisma.member.findUnique({
        where: { userId },
      });

      if (!member) {
        return res.status(404).json({ message: "Member profile not found" });
      }

      where.memberId = member.id;
    }

    const plans = await prisma.workoutPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        member: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        trainer: {
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

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch workout plans", error });
  }
};

export const createWorkoutPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, exercises, notes, memberId, trainerId } =
      req.body;

    let finalTrainerId = trainerId ? Number(trainerId) : null;

    if (req.user?.role === "TRAINER") {
      const trainer = await prisma.trainer.findUnique({
        where: { userId: req.user.id },
      });

      if (!trainer) {
        return res.status(404).json({ message: "Trainer profile not found" });
      }

      finalTrainerId = trainer.id;
    }

    const plan = await prisma.workoutPlan.create({
      data: {
        title,
        description,
        exercises,
        notes,
        memberId: Number(memberId),
        trainerId: finalTrainerId,
      },
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Failed to create workout plan", error });
  }
};

export const updateWorkoutPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, exercises, notes } = req.body;

    const plan = await prisma.workoutPlan.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        exercises,
        notes,
      },
    });

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: "Failed to update workout plan", error });
  }
};

export const deleteWorkoutPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.workoutPlan.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Workout plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete workout plan", error });
  }
};
import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getProgressRecords = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    let where: any = {};

    if (role === "MEMBER") {
      const member = await prisma.member.findUnique({
        where: { userId },
      });

      if (!member) {
        return res.status(404).json({ message: "Member profile not found" });
      }

      where.memberId = member.id;
    }

    if (role === "TRAINER") {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer) {
        return res.status(404).json({ message: "Trainer profile not found" });
      }

      where.trainerId = trainer.id;
    }

    const records = await prisma.progressRecord.findMany({
      where,
      orderBy: {
        recordedDate: "desc",
      },
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

    return res.json(records);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch progress records",
      error,
    });
  }
};

export const createProgressRecord = async (req: AuthRequest, res: Response) => {
  try {
    const {
      memberId,
      trainerId,
      weight,
      height,
      chest,
      waist,
      arms,
      notes,
      recordedDate,
    } = req.body;

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

    const record = await prisma.progressRecord.create({
      data: {
        memberId: Number(memberId),
        trainerId: finalTrainerId,
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        chest: chest ? Number(chest) : null,
        waist: waist ? Number(waist) : null,
        arms: arms ? Number(arms) : null,
        notes,
        recordedDate: recordedDate ? new Date(recordedDate) : new Date(),
      },
    });

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create progress record",
      error,
    });
  }
};

export const updateProgressRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { weight, height, chest, waist, arms, notes, recordedDate } = req.body;

    const record = await prisma.progressRecord.update({
      where: {
        id: Number(id),
      },
      data: {
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        chest: chest ? Number(chest) : null,
        waist: waist ? Number(waist) : null,
        arms: arms ? Number(arms) : null,
        notes,
        recordedDate: recordedDate ? new Date(recordedDate) : undefined,
      },
    });

    return res.json(record);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update progress record",
      error,
    });
  }
};

export const deleteProgressRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.progressRecord.delete({
      where: {
        id: Number(id),
      },
    });

    return res.json({
      message: "Progress record deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete progress record",
      error,
    });
  }
};
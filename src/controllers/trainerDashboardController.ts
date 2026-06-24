import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getTrainerDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { userId: req.user?.id },
      include: {
        user: true,
        members: {
          include: {
            user: true,
            membership: true,
            attendance: {
              orderBy: { checkIn: "desc" },
              take: 3,
            },
          },
        },
      },
    });

    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    return res.json({
      trainer,
      totalAssignedMembers: trainer.members.length,
      activeMembers: trainer.members.filter((m) => m.status === "ACTIVE").length,
      expiredMembers: trainer.members.filter((m) => m.status === "EXPIRED").length,
      members: trainer.members,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load trainer dashboard",
      error,
    });
  }
};
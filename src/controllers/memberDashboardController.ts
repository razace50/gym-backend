import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getMemberDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const member = await prisma.member.findUnique({
      where: { userId: req.user?.id },
      include: {
        user: true,
        membership: true,
        trainer: {
          include: {
            user: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        attendance: {
          orderBy: { checkIn: "desc" },
          take: 10,
        },
      },
    });

    if (!member) {
      return res.status(404).json({ message: "Member profile not found" });
    }

    return res.json(member);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load member dashboard",
      error,
    });
  }
};
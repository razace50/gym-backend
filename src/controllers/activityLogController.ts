import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getActivityLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const logs = await prisma.activityLog.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        performedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get activity logs",
      error,
    });
  }
};
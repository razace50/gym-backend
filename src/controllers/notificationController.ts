import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getNotifications = async (_req: AuthRequest, res: Response) => {
  try {
    const today = new Date();

    const sevenDays = new Date();
    sevenDays.setDate(today.getDate() + 7);

    const expiringMembers = await prisma.member.findMany({
      where: {
        membershipEnd: {
          gte: today,
          lte: sevenDays,
        },
      },
      include: {
        user: true,
        membership: true,
      },
      orderBy: {
        membershipEnd: "asc",
      },
    });

    const expiredMembers = await prisma.member.findMany({
      where: {
        membershipEnd: {
          lt: today,
        },
      },
      include: {
        user: true,
        membership: true,
      },
      orderBy: {
        membershipEnd: "asc",
      },
    });

    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const inactiveMembers = await prisma.member.findMany({
      where: {
        status: "INACTIVE",
      },
      include: {
        user: true,
        membership: true,
      },
    });

    return res.json({
      expiringMembers,
      expiredMembers,
      pendingPayments,
      inactiveMembers,
      total:
        expiringMembers.length +
        expiredMembers.length +
        pendingPayments.length +
        inactiveMembers.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch notifications",
      error,
    });
  }
};
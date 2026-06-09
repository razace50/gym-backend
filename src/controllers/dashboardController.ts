import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getDashboardStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalMembers,
      totalTrainers,
      totalMemberships,
      totalUsers,
      totalPayments,
      paidPayments,
      pendingPayments,
      totalRevenue,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.trainer.count(),
      prisma.membership.count(),
      prisma.user.count(),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: "PAID" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      totalMembers,
      totalTrainers,
      totalMemberships,
      totalUsers,
      totalPayments,
      paidPayments,
      pendingPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get dashboard stats", error });
  }
};
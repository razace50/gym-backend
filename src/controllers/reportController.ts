import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getReports = async (_req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const startToday = new Date(today.setHours(0, 0, 0, 0));
    const endToday = new Date(today.setHours(23, 59, 59, 999));

    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      totalRevenue,
      paidPayments,
      pendingPayments,
      todayAttendance,
      totalExpenses,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: "ACTIVE" } }),
      prisma.member.count({ where: { status: "EXPIRED" } }),

      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),

      prisma.payment.count({ where: { status: "PAID" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),

      prisma.attendance.count({
        where: {
          checkIn: {
            gte: startToday,
            lte: endToday,
          },
        },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
      }),
      
    ]);
    const revenue = totalRevenue._sum.amount || 0;
const expenses = totalExpenses._sum.amount || 0;

    res.json({
      totalMembers,
      activeMembers,
      expiredMembers,
      totalRevenue: totalRevenue._sum.amount || 0,
      paidPayments,
      pendingPayments,
      todayAttendance,
      
totalExpenses: expenses,
netProfit: revenue - expenses,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate report", error });
  }
};
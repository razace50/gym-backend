import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getDashboardStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const today = new Date();

    const threeDays = new Date();
    threeDays.setDate(today.getDate() + 3);

    const sevenDays = new Date();
    sevenDays.setDate(today.getDate() + 7);

    const firstDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const [
      totalMembers,
      totalTrainers,
      totalMemberships,
      monthlyJoined,
      expiringIn3Days,
      expiringIn7Days,
      expiredMembers,
      inactiveMembers,
      totalRevenue,
      recentMembers,
      recentPayments,
      expiringMembers,
      todayCheckIns,
    ] = await Promise.all([
      prisma.member.count(),

      prisma.trainer.count(),

      prisma.membership.count(),

      prisma.member.count({
        where: {
          joinDate: {
            gte: firstDayOfMonth,
          },
        },
      }),

      prisma.member.count({
        where: {
          membershipEnd: {
            gte: today,
            lte: threeDays,
          },
        },
      }),

      prisma.member.count({
        where: {
          membershipEnd: {
            gt: threeDays,
            lte: sevenDays,
          },
        },
      }),

      prisma.member.count({
        where: {
          membershipEnd: {
            lt: today,
          },
        },
      }),

      prisma.member.count({
        where: {
          status: "INACTIVE",
        },
      }),

      prisma.payment.aggregate({
        where: {
          status: "PAID",
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.member.findMany({
        take: 5,
        orderBy: {
          joinDate: "desc",
        },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          },
          membership: true,
        },
      }),

      prisma.payment.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
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
        },
      }),

      prisma.member.findMany({
        take: 5,
        where: {
          membershipEnd: {
            gte: today,
            lte: sevenDays,
          },
        },
        orderBy: {
          membershipEnd: "asc",
        },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          },
          membership: true,
        },
      }),

      prisma.attendance.findMany({
        take: 5,
        where: {
          checkOut: null,
        },
        orderBy: {
          checkIn: "desc",
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
        },
      }),
    ]);

    res.json({
      totalMembers,
      totalTrainers,
      totalMemberships,
      monthlyJoined,
      expiringIn3Days,
      expiringIn7Days,
      expiredMembers,
      inactiveMembers,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentMembers,
      recentPayments,
      expiringMembers,
      todayCheckIns,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get dashboard stats",
      error,
    });
  }
};
import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

const getMonthLabel = (date: Date) =>
  date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });

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

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

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
      paidPayments,
      allMembers,
      memberships,
      paymentStatusRows,
      activityLogs,
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
          createdBy: {
            select: {
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      }),

      prisma.payment.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          collectedBy: {
            select: {
              fullName: true,
              email: true,
              role: true,
            },
          },
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

      prisma.payment.findMany({
        where: {
          status: "PAID",
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          amount: true,
          createdAt: true,
        },
      }),

      prisma.member.findMany({
        orderBy: {
          joinDate: "asc",
        },
        select: {
          joinDate: true,
        },
      }),

      prisma.membership.findMany({
        select: {
          name: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      }),

      prisma.payment.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),

      prisma.activityLog.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          performedBy: {
            select: {
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const revenueMap: Record<string, number> = {};

    paidPayments.forEach((payment) => {
      const month = getMonthLabel(payment.createdAt);
      revenueMap[month] = (revenueMap[month] || 0) + payment.amount;
    });

    const revenueChart = Object.entries(revenueMap).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    const memberGrowthMap: Record<string, number> = {};

    allMembers.forEach((member) => {
      const month = getMonthLabel(member.joinDate);
      memberGrowthMap[month] = (memberGrowthMap[month] || 0) + 1;
    });

    const memberGrowthChart = Object.entries(memberGrowthMap).map(
      ([month, members]) => ({
        month,
        members,
      })
    );

    const membershipDistribution = memberships.map((membership) => ({
      name: membership.name,
      value: membership._count.members,
    }));

    const paymentStatusChart = paymentStatusRows.map((payment) => ({
      status: payment.status,
      count: payment._count.status,
    }));

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
      revenueChart,
      memberGrowthChart,
      membershipDistribution,
      paymentStatusChart,
      activityLogs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get dashboard stats",
      error,
    });
  }
};

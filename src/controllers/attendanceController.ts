import { Response } from "express";
import { Prisma } from "../generated/prisma";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getAttendance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { date, memberId } = req.query;

    let where: Prisma.AttendanceWhereInput = {};

    if (memberId) {
      const parsedMemberId = Number(memberId);

      if (Number.isNaN(parsedMemberId)) {
        res.status(400).json({ message: "Invalid member id" });
        return;
      }

      where.memberId = parsedMemberId;
    }

    if (date) {
      const start = new Date(String(date));
      const end = new Date(String(date));
      end.setDate(end.getDate() + 1);

      where.checkIn = {
        gte: start,
        lt: end,
      };
    }

    if (req.user?.role === "TRAINER") {
      const trainer = await prisma.trainer.findUnique({
        where: { userId: req.user.id },
      });

      if (!trainer) {
        res.status(404).json({ message: "Trainer profile not found" });
        return;
      }

      where = {
        ...where,
        member: {
          trainerId: trainer.id,
        },
      };
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: { checkIn: "desc" },
      include: {
        member: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attendance",
      error,
    });
  }
};

export const checkIn = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { memberId } = req.body;
    const parsedMemberId = Number(memberId);

    if (!parsedMemberId || Number.isNaN(parsedMemberId)) {
      res.status(400).json({ message: "Valid memberId is required" });
      return;
    }

    const member = await prisma.member.findUnique({
      where: { id: parsedMemberId },
      include: {
        trainer: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    if (req.user?.role === "TRAINER") {
      const trainer = await prisma.trainer.findUnique({
        where: { userId: req.user.id },
      });

      if (!trainer || member.trainerId !== trainer.id) {
        res.status(403).json({
          message: "You can only mark attendance for your assigned members",
        });
        return;
      }
    }

    const existing = await prisma.attendance.findFirst({
      where: {
        memberId: parsedMemberId,
        checkOut: null,
      },
    });

    if (existing) {
      res.status(400).json({
        message: `${member.user.fullName} is already checked in`,
      });
      return;
    }

    const attendance = await prisma.attendance.create({
      data: {
        memberId: parsedMemberId,
        checkIn: new Date(),
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Failed to check in",
      error,
    });
  }
};

export const checkOut = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const attendanceId = Number(req.params.id);

    if (!attendanceId || Number.isNaN(attendanceId)) {
      res.status(400).json({ message: "Invalid attendance id" });
      return;
    }

    const attendanceRecord = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        member: true,
      },
    });

    if (!attendanceRecord) {
      res.status(404).json({ message: "Attendance record not found" });
      return;
    }

    if (attendanceRecord.checkOut) {
      res.status(400).json({ message: "Member already checked out" });
      return;
    }

    if (req.user?.role === "TRAINER") {
      const trainer = await prisma.trainer.findUnique({
        where: { userId: req.user.id },
      });

      if (!trainer || attendanceRecord.member.trainerId !== trainer.id) {
        res.status(403).json({
          message: "You can only check out your assigned members",
        });
        return;
      }
    }

    const attendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        checkOut: new Date(),
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Failed to check out",
      error,
    });
  }
};
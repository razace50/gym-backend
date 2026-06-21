import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getAttendance = async (_req: AuthRequest, res: Response) => {
  try {
    const attendance = await prisma.attendance.findMany({
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
    res.status(500).json({ message: "Failed to get attendance", error });
  }
};

export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const { memberId } = req.body;

    const member = await prisma.member.findUnique({
      where: { id: Number(memberId) },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Only active members can check in",
      });
    }

    const alreadyCheckedIn = await prisma.attendance.findFirst({
      where: {
        memberId: Number(memberId),
        checkOut: null,
      },
    });

    if (alreadyCheckedIn) {
      return res.status(400).json({ message: "Member already checked in" });
    }

    const attendance = await prisma.attendance.create({
      data: {
        memberId: Number(memberId),
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Check-in failed", error });
  }
};

export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid attendance id" });
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!existingAttendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (existingAttendance.checkOut) {
      return res.status(400).json({ message: "Member already checked out" });
    }

    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        checkOut: new Date(),
      },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Check-out failed", error });
  }
};
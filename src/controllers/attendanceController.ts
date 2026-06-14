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
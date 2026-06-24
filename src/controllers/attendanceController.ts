import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { date, memberId } = req.query;

    const where: any = {};

    if (memberId) {
      where.memberId = Number(memberId);
    }

    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);

      where.checkIn = {
        gte: start,
        lt: end,
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
    res.status(500).json({ message: "Failed to fetch attendance", error });
  }
};

export const checkIn = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.body;

    const existing = await prisma.attendance.findFirst({
      where: {
        memberId: Number(memberId),
        checkOut: null,
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Member already checked in" });
    }

    const attendance = await prisma.attendance.create({
      data: {
        memberId: Number(memberId),
        checkIn: new Date(),
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Failed to check in", error });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.update({
      where: { id: Number(id) },
      data: {
        checkOut: new Date(),
      },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Failed to check out", error });
  }
};
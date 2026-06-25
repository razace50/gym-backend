import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getGymSettings = async (_req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.gymSetting.findFirst();

    if (!settings) {
      settings = await prisma.gymSetting.create({
        data: {
          gymName: "Hamro Gym",
          currency: "AUD",
        },
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get gym settings", error });
  }
};

export const updateGymSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { gymName, logoUrl, phone, email, address, currency, openingHours } =
      req.body;

    let settings = await prisma.gymSetting.findFirst();

    if (!settings) {
      settings = await prisma.gymSetting.create({
        data: {
          gymName,
          logoUrl,
          phone,
          email,
          address,
          currency,
          openingHours,
        },
      });
    } else {
      settings = await prisma.gymSetting.update({
        where: { id: settings.id },
        data: {
          gymName,
          logoUrl,
          phone,
          email,
          address,
          currency,
          openingHours,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update gym settings", error });
  }
};
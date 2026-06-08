import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getMemberships = async (req: AuthRequest, res: Response) => {
  try {
    const memberships = await prisma.membership.findMany();
    return res.json(memberships);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get memberships", error });
  }
};

export const createMembership = async (req: AuthRequest, res: Response) => {
  try {
    const { name, duration, price } = req.body;

    const membership = await prisma.membership.create({
      data: {
        name,
        duration: Number(duration),
        price: Number(price),
      },
    });

    return res.status(201).json(membership);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create membership", error });
  }
};
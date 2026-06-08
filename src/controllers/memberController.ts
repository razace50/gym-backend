// src/controllers/memberController.ts
import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getMembers = async (req: AuthRequest, res: Response) => {
  const members = await prisma.member.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      membership: true,
      trainer: {
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
  });

  res.json(members);
};

export const createMember = async (req: AuthRequest, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      age,
      gender,
      address,
      membershipId,
      trainerId,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await prisma.member.create({
      data: {
        age: age ? Number(age) : null,
        gender,
        address,
        membershipId: membershipId ? Number(membershipId) : null,
        trainerId: trainerId ? Number(trainerId) : null,
        user: {
          create: {
            fullName,
            email,
            phone,
            password: hashedPassword,
            role: "MEMBER",
          },
        },
      },
      include: {
        user: true,
        membership: true,
      },
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: "Failed to create member", error });
  }
};
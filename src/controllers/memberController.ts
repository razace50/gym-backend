// src/controllers/memberController.ts
import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Role } from "../generated/prisma";


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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await prisma.member.create({
      data: {
        age: age ? Number(age) : null,
        gender,
        address,

        user: {
          create: {
            fullName,
            email,
            phone,
            password: hashedPassword,
            role: Role.MEMBER,
          },
        },

        membership: membershipId
          ? {
              connect: {
                id: Number(membershipId),
              },
            }
          : undefined,

        trainer: trainerId
          ? {
              connect: {
                id: Number(trainerId),
              },
            }
          : undefined,
      },
      include: {
        user: true,
        membership: true,
        trainer: {
          include: {
            user: true,
          },
        },
      },
    });

    return res.status(201).json(member);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create member",
      error,
    });
  }
};
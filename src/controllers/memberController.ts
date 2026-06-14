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
export const getMemberById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const member = await prisma.member.findUnique({
      where: { id },
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

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.json(member);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get member", error });
  }
};

export const updateMember = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const {
      fullName,
      email,
      phone,
      age,
      gender,
      address,
      membershipId,
      trainerId,
    } = req.body;

    const existingMember = await prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        age: age ? Number(age) : null,
        gender,
        address,
        membershipId: membershipId ? Number(membershipId) : null,
        trainerId: trainerId ? Number(trainerId) : null,
        user: {
          update: {
            fullName,
            email,
            phone,
          },
        },
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

    return res.json(member);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update member", error });
  }
};

export const deleteMember = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    await prisma.payment.deleteMany({
      where: { memberId: id },
    });

    await prisma.attendance.deleteMany({
      where: { memberId: id },
    });

    await prisma.member.delete({
      where: { id },
    });

    await prisma.user.delete({
      where: { id: member.userId },
    });

    return res.json({ message: "Member deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete member", error });
  }
};
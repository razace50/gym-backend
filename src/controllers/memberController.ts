import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Role } from "../generated/prisma";

const validMemberStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"];

export const getMembers = async (req: AuthRequest, res: Response) => {
  try {
    let whereCondition = {};

    if (req.user?.role === "TRAINER") {
      const trainer = await prisma.trainer.findUnique({
        where: { userId: req.user.id },
      });

      if (!trainer) {
        return res.status(403).json({ message: "Trainer profile not found" });
      }

      whereCondition = { trainerId: trainer.id };
    }

    const members = await prisma.member.findMany({
      where: whereCondition,
      orderBy: { joinDate: "desc" },
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
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return res.json(members);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get members", error });
  }
};

export const getMemberById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid member id" });
    }

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        user: true,
        membership: true,
        trainer: { include: { user: true } },
        payments: { orderBy: { createdAt: "desc" } },
        attendance: { orderBy: { checkIn: "desc" } },
      },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (req.user?.role === "MEMBER" && member.userId !== req.user.id) {
      return res.status(403).json({
        message: "Members can only view their own profile",
      });
    }

    if (req.user?.role === "TRAINER") {
      const trainer = await prisma.trainer.findUnique({
        where: { userId: req.user.id },
      });

      if (!trainer || member.trainerId !== trainer.id) {
        return res.status(403).json({
          message: "Trainers can only view assigned members",
        });
      }
    }

    return res.json(member);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get member", error });
  }
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

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "fullName, email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let membershipStart: Date | null = null;
    let membershipEnd: Date | null = null;

    if (membershipId) {
      const selectedMembership = await prisma.membership.findUnique({
        where: { id: Number(membershipId) },
      });

      if (!selectedMembership) {
        return res.status(404).json({ message: "Membership not found" });
      }

      membershipStart = new Date();
      membershipEnd = new Date();
      membershipEnd.setDate(membershipEnd.getDate() + selectedMembership.duration);
    }

    if (trainerId) {
      const trainer = await prisma.trainer.findUnique({
        where: { id: Number(trainerId) },
      });

      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await prisma.member.create({
      data: {
        age: age ? Number(age) : null,
        gender: gender || null,
        address: address || null,
        membershipStart,
        membershipEnd,
        status: "ACTIVE",
        user: {
          create: {
            fullName,
            email,
            phone: phone || null,
            password: hashedPassword,
            role: Role.MEMBER,
          },
        },
        membership: membershipId
          ? { connect: { id: Number(membershipId) } }
          : undefined,
        trainer: trainerId ? { connect: { id: Number(trainerId) } } : undefined,
      },
      include: {
        user: true,
        membership: true,
        trainer: { include: { user: true } },
      },
    });

    return res.status(201).json(member);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create member", error });
  }
};

export const updateMember = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid member id" });
    }

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
      include: { user: true, membership: true },
    });

    if (!existingMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    let membershipStart = existingMember.membershipStart;
    let membershipEnd = existingMember.membershipEnd;

    if (membershipId && Number(membershipId) !== existingMember.membershipId) {
      const selectedMembership = await prisma.membership.findUnique({
        where: { id: Number(membershipId) },
      });

      if (!selectedMembership) {
        return res.status(404).json({ message: "Membership not found" });
      }

      membershipStart = new Date();
      membershipEnd = new Date();
      membershipEnd.setDate(membershipEnd.getDate() + selectedMembership.duration);
    }

    if (trainerId) {
      const trainer = await prisma.trainer.findUnique({
        where: { id: Number(trainerId) },
      });

      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        age: age === "" || age === undefined ? null : Number(age),
        gender: gender || null,
        address: address || null,
        membershipStart,
        membershipEnd,
        membership: membershipId
          ? { connect: { id: Number(membershipId) } }
          : { disconnect: true },
        trainer: trainerId ? { connect: { id: Number(trainerId) } } : { disconnect: true },
        user: {
          update: {
            fullName,
            email,
            phone: phone || null,
          },
        },
      },
      include: {
        user: true,
        membership: true,
        trainer: { include: { user: true } },
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

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid member id" });
    }

    const member = await prisma.member.findUnique({ where: { id } });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    await prisma.payment.deleteMany({ where: { memberId: id } });
    await prisma.attendance.deleteMany({ where: { memberId: id } });
    await prisma.member.delete({ where: { id } });
    await prisma.user.delete({ where: { id: member.userId } });

    return res.json({ message: "Member deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete member", error });
  }
};

export const renewMembership = async (req: AuthRequest, res: Response) => {
  try {
    const memberId = Number(req.params.id);

    if (Number.isNaN(memberId)) {
      return res.status(400).json({ message: "Invalid member id" });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { membership: true },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (!member.membership) {
      return res.status(400).json({ message: "Member has no membership assigned" });
    }

    const membershipStart = new Date();
    const membershipEnd = new Date();
    membershipEnd.setDate(membershipEnd.getDate() + member.membership.duration);

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        membershipStart,
        membershipEnd,
        status: "ACTIVE",
      },
      include: {
        user: true,
        membership: true,
        trainer: { include: { user: true } },
      },
    });

    return res.json({
      message: "Membership renewed successfully",
      member: updatedMember,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to renew membership", error });
  }
};

export const updateMemberStatus = async (req: AuthRequest, res: Response) => {
  try {
    const memberId = Number(req.params.id);
    const { status } = req.body;

    if (Number.isNaN(memberId)) {
      return res.status(400).json({ message: "Invalid member id" });
    }

    if (!validMemberStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        allowedStatuses: validMemberStatuses,
      });
    }

    const existingMember = await prisma.member.findUnique({ where: { id: memberId } });

    if (!existingMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    const member = await prisma.member.update({
      where: { id: memberId },
      data: { status },
      include: {
        user: true,
        membership: true,
        trainer: { include: { user: true } },
      },
    });

    return res.json({ message: "Status updated successfully", member });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status", error });
  }
};

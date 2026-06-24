import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const renewMemberMembership = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const memberId = Number(req.params.memberId);
    const { newMembershipId, amount } = req.body;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { membership: true },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const newMembership = await prisma.membership.findUnique({
      where: { id: Number(newMembershipId) },
    });

    if (!newMembership) {
      return res.status(404).json({ message: "Membership plan not found" });
    }

    const startDate =
      member.membershipEnd && member.membershipEnd > new Date()
        ? new Date(member.membershipEnd)
        : new Date();

    const newEndDate = new Date(startDate);
    newEndDate.setMonth(newEndDate.getMonth() + newMembership.duration);

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        membershipId: newMembership.id,
        membershipStart: startDate,
        membershipEnd: newEndDate,
        status: "ACTIVE",
      },
    });

    const renewal = await prisma.membershipRenewal.create({
      data: {
        memberId,

        oldMembershipId: member.membershipId,
        newMembershipId: newMembership.id,
        oldEndDate: member.membershipEnd,
        newEndDate,
        amount: Number(amount),
        renewedById: req.user?.id,
      },
    });

    return res.json({
      message: "Membership renewed successfully",
      updatedMember,
      renewal,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to renew membership",
      error,
    });
  }
};

export const getMemberRenewalHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const memberId = Number(req.params.memberId);

    const renewals = await prisma.membershipRenewal.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
      include: {
  renewedBy: {
    select: {
      fullName: true,
      email: true,
      role: true,
    },
  },
  oldMembership: true,
  newMembership: true,
},
    });

    return res.json(renewals);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch renewal history",
      error,
    });
  }
};
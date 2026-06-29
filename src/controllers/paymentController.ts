import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { logActivity } from "../utils/activityLogger";

const allowedStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const paymentInclude = {
  collectedBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },
  member: {
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      membership: true,
    },
  },
};

export const getPayments = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: paymentInclude,
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to get payments", error });
  }
};

export const getPaymentById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "Invalid payment id" });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: paymentInclude,
    });

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Failed to get payment", error });
  }
};

export const getPaymentsByMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const memberId = Number(req.params.memberId);

    if (Number.isNaN(memberId)) {
      res.status(400).json({ message: "Invalid member id" });
      return;
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    if (req.user?.role === "MEMBER" && member.userId !== req.user.id) {
      res.status(403).json({
        message: "Members can only view their own payments",
      });
      return;
    }

    const payments = await prisma.payment.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
      include: paymentInclude,
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to get member payments", error });
  }
};

export const createPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { memberId, amount, status } = req.body;

    const finalStatus = status || "PENDING";

    if (!allowedStatuses.includes(finalStatus)) {
      res.status(400).json({
        message: "Invalid payment status",
        allowedStatuses,
      });
      return;
    }

    const member = await prisma.member.findUnique({
      where: { id: Number(memberId) },
      include: { user: true },
    });

    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    const payment = await prisma.payment.create({
      data: {
        memberId: Number(memberId),
        amount: Number(amount),
        status: finalStatus,
        collectedById: req.user?.id,
      },
      include: paymentInclude,
    });

    await logActivity({
      action: "CREATE",
      entityType: "PAYMENT",
      entityId: payment.id,
      description: `${req.user?.email || "System"} collected payment of $${payment.amount} from ${member.user.fullName}`,
      performedById: req.user?.id,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create payment", error });
  }
};

export const updatePaymentStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "Invalid payment id" });
      return;
    }

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        message: "Invalid payment status",
        allowedStatuses,
      });
      return;
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
      include: paymentInclude,
    });

    await logActivity({
      action: "STATUS_UPDATE",
      entityType: "PAYMENT",
      entityId: payment.id,
      description: `${req.user?.email || "System"} changed payment status to ${status}`,
      performedById: req.user?.id,
    });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Failed to update payment status", error });
  }
};

export const deletePayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "Invalid payment id" });
      return;
    }

    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    await prisma.payment.delete({
      where: { id },
    });

    await logActivity({
      action: "DELETE",
      entityType: "PAYMENT",
      entityId: id,
      description: `${req.user?.email || "System"} deleted payment record #${id}`,
      performedById: req.user?.id,
    });

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete payment", error });
  }
};

import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

const allowedStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export const getPayments = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
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
      },
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

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
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
      },
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

    const payments = await prisma.payment.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
      include: {
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
      },
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

    if (!memberId || !amount) {
      res.status(400).json({ message: "memberId and amount are required" });
      return;
    }

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
      },
      include: {
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
      },
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

    await prisma.payment.delete({
      where: { id },
    });

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete payment", error });
  }
};
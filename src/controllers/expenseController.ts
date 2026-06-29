import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getExpenses = async (_req: AuthRequest, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        expenseDate: "desc",
      },
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch expenses",
      error,
    });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, amount, expenseDate, notes } = req.body;

    const expense = await prisma.expense.create({
      data: {
        title,
        category,
        amount: Number(amount),
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        notes,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create expense",
      error,
    });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, amount, expenseDate, notes } = req.body;

    const expense = await prisma.expense.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        category,
        amount: Number(amount),
        expenseDate: expenseDate ? new Date(expenseDate) : undefined,
        notes,
      },
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update expense",
      error,
    });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.expense.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete expense",
      error,
    });
  }
};
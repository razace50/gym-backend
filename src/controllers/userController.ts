import {Response} from "express";
import prisma from "../config/prisma";
import {AuthRequest} from "../middlewares/authMiddleware";

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullname: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            }
        });
        return res.json(users);
    } catch (error) {
        return res.status(500).json({message: "Failed to fetch users", error});
    }
    };

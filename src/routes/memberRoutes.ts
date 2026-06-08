import { Router } from "express";
import { createMember, getMembers } from "../controllers/memberController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "TRAINER"),
  getMembers
);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  createMember
);

export default router;
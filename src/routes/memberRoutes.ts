import { Router } from "express";
import {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  renewMembership,
  updateMemberStatus,
} from "../controllers/memberController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "TRAINER"),
  getMembers
);

router.get(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "TRAINER", "MEMBER"),
  getMemberById
);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  createMember
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  updateMember
);

router.patch(
  "/:id/renew",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  renewMembership
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  updateMemberStatus
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  deleteMember
);

export default router;

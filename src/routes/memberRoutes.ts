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
import { validateBody } from "../middlewares/validate";
import {
  createMemberSchema,
  updateMemberSchema,
  updateMemberStatusSchema,
  renewMembershipSchema,
} from "../validations/gymValidation";

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
  validateBody(createMemberSchema),
  createMember
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  validateBody(updateMemberSchema),
  updateMember
);

router.patch(
  "/:id/renew",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  validateBody(renewMembershipSchema),
  renewMembership
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  validateBody(updateMemberStatusSchema),
  updateMemberStatus
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  deleteMember
);

export default router;
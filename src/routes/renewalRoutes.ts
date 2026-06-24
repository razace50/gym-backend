import { Router } from "express";
import {
  renewMemberMembership,
  getMemberRenewalHistory,
} from "../controllers/renewalController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.post(
  "/:memberId",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  renewMemberMembership
);

router.get(
  "/:memberId",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "TRAINER", "MEMBER"),
  getMemberRenewalHistory
);

export default router;
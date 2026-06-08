import { Router } from "express";
import {
  getMemberships,
  createMembership,
} from "../controllers/membershipController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/", protect, getMemberships);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  createMembership
);

export default router;
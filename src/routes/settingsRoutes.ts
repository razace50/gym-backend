import { Router } from "express";
import {
  getGymSettings,
  updateGymSettings,
} from "../controllers/settingsController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "TRAINER", "MEMBER"),
  getGymSettings
);

router.patch(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  updateGymSettings
);

export default router;
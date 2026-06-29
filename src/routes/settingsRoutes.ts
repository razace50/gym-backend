import { Router } from "express";
import {
  getGymSettings,
  updateGymSettings,
} from "../controllers/settingsController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { uploadLogo } from "../middlewares/uploadLogo";

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
  uploadLogo.single("logoFile"),
  updateGymSettings
);

export default router;
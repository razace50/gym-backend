import { Router } from "express";
import { createTrainer, getTrainers } from "../controllers/trainerController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  getTrainers
);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  createTrainer
);

export default router;
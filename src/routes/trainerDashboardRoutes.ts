import { Router } from "express";
import { getTrainerDashboard } from "../controllers/trainerDashboardController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles("TRAINER"),
  getTrainerDashboard
);

export default router;
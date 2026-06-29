import { Router } from "express";
import {
  getWorkoutPlans,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} from "../controllers/workoutPlanController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "TRAINER", "MEMBER"),
  getWorkoutPlans
);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "TRAINER"),
  createWorkoutPlan
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "TRAINER"),
  updateWorkoutPlan
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "TRAINER"),
  deleteWorkoutPlan
);

export default router;
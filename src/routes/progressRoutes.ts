import { Router } from "express";
import {
  getProgressRecords,
  createProgressRecord,
  updateProgressRecord,
  deleteProgressRecord,
} from "../controllers/progressController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "TRAINER", "MEMBER"),
  getProgressRecords
);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "TRAINER"),
  createProgressRecord
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "TRAINER"),
  updateProgressRecord
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "TRAINER"),
  deleteProgressRecord
);

export default router;
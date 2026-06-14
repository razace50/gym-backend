import { Router } from "express";
import {
  getAttendance,
  checkIn,
  checkOut,
} from "../controllers/attendanceController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "TRAINER"),
  getAttendance
);

router.post(
  "/check-in",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  checkIn
);

router.patch(
  "/:id/check-out",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  checkOut
);

export default router;
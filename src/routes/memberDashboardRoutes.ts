import { Router } from "express";
import { getMemberDashboard } from "../controllers/memberDashboardController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get("/", protect, authorizeRoles("MEMBER"), getMemberDashboard);

export default router;
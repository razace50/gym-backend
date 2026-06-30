import {Router} from "express";
import { getActivityLogs } from "../controllers/activityLogController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
    "/",
    protect,
    authorizeRoles("SUPER_ADMIN", "ADMIN"),
    getActivityLogs
);
export default router;
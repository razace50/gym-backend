import { Router } from "express";
import {getUsers} from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();
router.get("/",
    protect,
    authorizeRoles("SUPER_ADMIN", "ADMIN"),
    getUsers);
export default router;
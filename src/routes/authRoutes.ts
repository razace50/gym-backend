// src/routes/authRoutes.ts
import { Router } from "express";
import { login, register } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.post("/login", login);

router.post(
  "/register",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  register
);

export default router;
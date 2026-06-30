import { Router } from "express";
import {
  getMe,
  login,
  register,
  signupMember,
  changePassword,
  resetUserPassword,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.post("/login", login);
router.post("/signup", signupMember);
router.get("/me", protect, getMe);

router.post(
  "/register",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  register
);

router.patch("/change-password", protect, changePassword);

router.patch(
  "/users/:id/reset-password",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  resetUserPassword
);
export default router;
import { Router } from "express";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  getExpenses
);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  createExpense
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  updateExpense
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  deleteExpense
);

export default router;
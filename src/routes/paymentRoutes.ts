import { Router } from "express";
import {
  createPayment,
  getPayments,
  getPaymentById,
  getPaymentsByMember,
  updatePaymentStatus,
  deletePayment,
} from "../controllers/paymentController";
import { protect } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { validateBody } from "../middlewares/validate";
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
} from "../validations/gymValidation";

const router = Router();

router.get(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  getPayments
);

router.get(
  "/member/:memberId",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "MEMBER"),
  getPaymentsByMember
);

router.get(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  getPaymentById
);

router.post(
  "/",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  validateBody(createPaymentSchema),
  createPayment
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN", "RECEPTIONIST"),
  validateBody(updatePaymentStatusSchema),
  updatePaymentStatus
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  deletePayment
);

export default router;
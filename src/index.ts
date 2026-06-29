import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import memberRoutes from "./routes/memberRoutes";
import trainerRoutes from "./routes/trainerRoutes";
import membershipRoutes from "./routes/membershipRoutes";
import userRoutes from "./routes/userRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import trainerDashboardRoutes from "./routes/trainerDashboardRoutes";
import memberDashboardRoutes from "./routes/memberDashboardRoutes";
import renewalRoutes from "./routes/renewalRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import path from "path";
import reportRoutes from "./routes/reportRoutes";
import workoutPlanRoutes from "./routes/workoutPlanRoutes";
import progressRoutes from "./routes/progressRoutes";
import expenseRoutes from "./routes/expenseRoutes";


dotenv.config();

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);
app.get("/", (_req, res) => {
    res.send("Gym Management api is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/trainer-dashboard", trainerDashboardRoutes);
app.use("/api/member-dashboard", memberDashboardRoutes);
app.use("/api/renewals", renewalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
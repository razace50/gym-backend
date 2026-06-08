import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import memberRoutes from "./routes/memberRoutes";
import trainerRoutes from "./routes/trainerRoutes";
import membershipRoutes from "./routes/membershipRoutes";
import userRoutes from "./routes/userRoutes";



dotenv.config();

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/users", userRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
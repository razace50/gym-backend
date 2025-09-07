import express  from 'express';
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/users", userRoutes);
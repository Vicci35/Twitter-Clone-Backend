import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api", authRoutes);

export default app;

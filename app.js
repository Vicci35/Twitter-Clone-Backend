import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.js";
import authRoutes from "./routes/auth_login.js";
import postRoutes from "./routes/posts.js";
import dashRouter from "./routes/dashboard.js";
import signupRoute from "./routes/auth_signup.js";
import followRoutes from "./routes/follow.js";
import profileRoutes from "./routes/auth_profile.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/dashboard", dashRouter);
app.use("/api", signupRoute);
app.use("/api", followRoutes);
app.use("/api", profileRoutes);

export default app;

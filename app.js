import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

import userRoutes from "./routes/user.js";
import authRoutes from "./routes/auth_login.js";
import postRoutes from "./routes/posts.js";
import dashRouter from "./routes/dashboard.js";
import signupRoute from "./routes/auth_signup.js";
import followRoutes from "./routes/follow.js";
import profileRoutes from "./routes/auth_profile.js";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ Ny klient ansluten:", socket.id);

  socket.on("newTweet", (data) => {
    socket.broadcast.emit("tweetFromOtherUser", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Klient frånkopplad:", socket.id);
  });
});
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/dashboard", dashRouter);
app.use("/api", signupRoute);
app.use("/api", followRoutes);
app.use("/api", profileRoutes);
app.use("/uploads", express.static("uploads"));

// 👇 Exportera både server och io
export { server, io };

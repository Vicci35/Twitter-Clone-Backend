import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { server } from "./app.js"; // 👈 nu får du rätt instans
import mongoKey from "./config/db.js";

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(mongoKey, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(`🚀 Servern körs på http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ FEL vid anslutning:", error.message);
    process.exit(1);
  }
}

start();

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";
import mongoKey from "./config/db.js";

const PORT = 3000;

async function start() {
  try {
    await mongoose.connect(mongoKey);
    console.log(" Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server started: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("FEL vid anslutning:", error.message);
    process.exit(1);
  }
}

start();

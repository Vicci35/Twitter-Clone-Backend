import mongoose from "mongoose";
import dotenv from "dotenv";
import { describe, it, expect } from "vitest"; 


dotenv.config();

describe("MongoDB Connection Test", () => {
  it("should successfully connect to MongoDB", async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB anslutning lyckades!");
      expect(true).toBe(true); 
    } catch (err) {
      console.error("Kunde inte ansluta till MongoDB:", err);
      expect(true).toBe(false); 
    }
  });
});

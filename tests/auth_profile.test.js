import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import { getHashedPassword } from "../services/auth.js";
import { describe, it, beforeAll, afterEach, afterAll, expect } from "vitest";
import dotenv from "dotenv";

dotenv.config();

let token; 

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: "profiltest@test.com" });

  const hashedPassword = await getHashedPassword("lösenord123");
  await User.create({
    email: "profiltest@test.com",
    password: hashedPassword,
    name: "Profil Testare",
    nickname: "profiltest",
  });


  const loginRes = await request(app)
    .post("/api/login")
    .send({ email: "profiltest@test.com", password: "lösenord123" });

  token = loginRes.body.token;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("GET /profile/:id", () => {
  it("returnera en användarprofil", async () => {
 const user = await User.findOne({ email: "profiltest@test.com" });

    const res = await request(app)
      .get(`/api/profile/${user._id}`)
      .set("Authorization", `Bearer ${token}`); 

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("profiltest@test.com");
    expect(res.body.name).toBe("Profil Testare");
});

  it("ska returnera 404 om användaren inte finns", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/profile/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});
import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import { getHashedPassword } from "../services/auth.js";
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create(); 
  const uri = mongoServer.getUri();

  await mongoose.connect(uri); 

  const hashedPassword = await getHashedPassword("lösenord123");
  await User.create({
    email: "test@example.com",
    password: hashedPassword,
    name: "Test Användare",
    nickname: "testarn",
  });
});

beforeEach(async () => {
  
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  const hashedPassword = await getHashedPassword("lösenord123");
  await User.create({
    email: "test@example.com",
    password: hashedPassword,
    name: "Test Användare",
    nickname: "testarn",
  });
});


afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop(); 
});

describe("Login tests", () => {
  it("ska logga in korrekt användare och returnera token", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "test@example.com", password: "lösenord123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("ska returnera 401 vid felaktigt lösenord", async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@example.com",
      password: "felLösen",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Fel lösenord.");
  });
});

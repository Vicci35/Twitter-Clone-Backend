import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import Follow from "../models/Follow.js";
import User from "../models/User.js";
import { getHashedPassword } from "../services/auth.js";
import { describe, it, beforeAll, afterAll, expect, beforeEach } from "vitest";

let userA, userB;
let tokenA;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI); // samma URI som i dina andra tester

  await User.deleteMany({});
  await Follow.deleteMany({});

  const hashedPassword = await getHashedPassword("password123");

  userA = await User.create({
    email: "usera@test.com",
    password: hashedPassword,
    name: "User A",
    nickname: "aUser",
  });

  userB = await User.create({
    email: "userb@test.com",
    password: hashedPassword,
    name: "User B",
    nickname: "bUser",
  });

  // Logga in userA för att få JWT-token
  const res = await request(app).post("/api/login").send({
    email: "usera@test.com",
    password: "password123",
  });

  tokenA = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Follow.deleteMany({});
});

describe("Follow Routes", () => {
  it("returnerar 400 om targetUserId saknas", async () => {
    const res = await request(app)
      .post("/api/follow")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing targetUserId");
  });

  it("returnerar 400 om man försöker följa sig själv", async () => {
    const res = await request(app)
      .post("/api/follow")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ targetUserId: userA._id });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("You cannot follow yourself");
  });

  it("följer en annan användare korrekt", async () => {
    const res = await request(app)
      .post("/api/follow")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ targetUserId: userB._id });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Followed successfully");
  });

  it("returnerar 400 om man redan följer användaren", async () => {
    await Follow.create({
      followerId: userA._id,
      targetUserId: userB._id,
    });

    const res = await request(app)
      .post("/api/follow")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ targetUserId: userB._id });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Already following this user");
  });

  it("avföljer en användare korrekt", async () => {
    await Follow.create({
      followerId: userA._id,
      targetUserId: userB._id,
    });

    const res = await request(app)
      .post("/api/unfollow")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ targetUserId: userB._id });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Unfollowed successfully");
  });

  it("returnerar följelista korrekt", async () => {
    await Follow.create({
      followerId: userA._id,
      targetUserId: userB._id,
    });

    const res = await request(app)
      .get("/api/following")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.following).toHaveLength(1);
    expect(res.body.following[0].nickname).toBe("bUser");
  });

  it("hämtar följare för en användare", async () => {
    await Follow.create({
      followerId: userA._id,
      targetUserId: userB._id,
    });

    const res = await request(app)
      .get(`/api/followers/${userB._id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.followers).toHaveLength(1);
    expect(res.body.followers[0].nickname).toBe("aUser");
  });
});

import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { getHashedPassword } from "../services/auth.js";
import { describe, it, beforeAll, afterAll, expect } from "vitest";

let testUser;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteMany({});
  await Post.deleteMany({});

  const hashedPassword = await getHashedPassword("test123");

  testUser = await User.create({
    email: "posttest@test.com",
    password: hashedPassword,
    name: "Post Testare",
    nickname: "postarn",
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/posts", () => {
  it("ska skapa ett nytt inlägg med giltig data", async () => {
    const res = await request(app)
      .post("/api/posts")
      .send({
        content: "Detta är ett testinlägg",
        author: testUser._id.toString(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("content", "Detta är ett testinlägg");
    expect(res.body.author.nickname).toBe("postarn");
  });

  it("ska inte tillåta inlägg med för långt innehåll", async () => {
    const res = await request(app)
      .post("/api/posts")
      .send({
        content: "a".repeat(141),
        author: testUser._id.toString(),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Content exceeds 140 characters");
  });

  it("ska inte tillåta inlägg utan content", async () => {
    const res = await request(app)
      .post("/api/posts")
      .send({
        author: testUser._id.toString(),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing content or author");
  });

  it("ska inte tillåta inlägg från icke-existerande användare", async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post("/api/posts")
      .send({
        content: "Inlägg med felaktig användare",
        author: fakeUserId,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Author not found");
  });
});

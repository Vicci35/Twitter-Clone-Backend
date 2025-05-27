import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { getHashedPassword } from "../services/auth.js";

let testUserId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Post.deleteMany();
  await User.deleteMany();

  const hashedPassword = await getHashedPassword("feedtest123")

  const user = await User.create({
    email: "feedtest@test.com",
    password: hashedPassword, 
    name: "Feed Testare",
    nickname: "feedtest",
  });

  testUserId = user._id;

  await Post.create([
    { content: "Första inlägget", author: user._id },
    { content: "Andra inlägget", author: user._id },
  ]);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/posts/feed", () => {
  it("ska returnera alla inlägg i rätt ordning", async () => {
    const res = await request(app).get("/api/posts/feed");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("content");
    expect(res.body[0]).toHaveProperty("author.nickname");
  });
});

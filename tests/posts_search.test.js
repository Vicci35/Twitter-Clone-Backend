import request from "supertest";
import mongoose from "mongoose";
import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getHashedPassword } from "../services/auth.js";
import {app} from "../app.js"; 
import Post from "../models/Post.js";
import User from "../models/User.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

  beforeEach(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});

  const hashedPassword = await getHashedPassword("searchtest123")

   const user = await User.create({
    email: "searchtest@test.com",
    password: hashedPassword, 
    name: "SearchTestare",
    nickname: "Searchtest",
  });

  await Post.create([
    { content: "Det här är ett testinlägg om katter", author: user._id },
    { content: "Ett annat inlägg om hundar", author: user._id },
    { content: "Katter är fina djur", author: user._id },
    { content: "Inget att hitta här", author: user._id },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/posts/search", () => {
  it("ska returnera inlägg som innehåller sökordet", async () => {
    const res = await request(app).get("/api/posts/search?q=katter");

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2);

    const contents = res.body.map(post => post.content);
    expect(contents).toContain("Det här är ett testinlägg om katter");
    expect(contents).toContain("Katter är fina djur");
  });

  it("ska returnera en tom array om inga träffar hittas", async () => {
    const res = await request(app).get("/api/posts/search?q=dinosaurier");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("ska hantera saknad query-param", async () => {
    const res = await request(app).get("/api/posts/search");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Sökfråga saknas");
  });
});

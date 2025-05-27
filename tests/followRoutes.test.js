import { describe, it, beforeEach, vi, expect } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../routes/middleware/authToken.js", () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.user = { _id: "user1" };
    next();
  },
}));

import followRoutes from "../routes/follow.js";
import Follow from "../models/Follow.js";
import User from "../models/User.js";

vi.mock("../models/Follow");
vi.mock("../models/User");

const app = express();
app.use(express.json());
app.use("/api", followRoutes);

describe("Follow Routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 400 if targetUserId is missing", async () => {
    const res = await request(app).post("/api/follow").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing targetUserId");
  });

  it("returns 400 if trying to follow yourself", async () => {
    const res = await request(app)
      .post("/api/follow")
      .send({ targetUserId: "user1" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("You cannot follow yourself");
  });

  it("returns 400 if already following", async () => {
    Follow.findOne.mockResolvedValue({});

    const res = await request(app)
      .post("/api/follow")
      .send({ targetUserId: "user2" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Already following this user");
  });

  it("succesfully follows a user", async () => {
    Follow.findOne.mockResolvedValue(null);
    Follow.prototype.save = vi.fn().mockResolvedValue({});

    User.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post("/api/follow")
      .send({ targetUserId: "user2" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Followed successfully");
  });

  it("returns 500 on DB error", async () => {
    Follow.findOne.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/api/follow")
      .send({ targetUserId: "user2" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB error");
  });

  it("unfollows a user successfully", async () => {
    Follow.findOneAndDelete.mockResolvedValue({});
    User.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post("/api/unfollow")
      .send({ targetUserId: "user2" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Unfollowed succesfully");
  });

  it("returns 404 when unfollowing a user not followed", async () => {
    Follow.findOneAndDelete.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/unfollow")
      .send({ targetUserId: "user2" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not following this user");
  });

  it("returns following list", async () => {
    Follow.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue([
        {
          targetUserId: {
            _id: "user2",
            nickname: "nick2",
            name: "Name2",
          },
        },
      ]),
    });
    const res = await request(app).get("/api/following");

    expect(res.status).toBe(200);
    expect(res.body.following).toEqual([
      { id: "user2", nickname: "nick2", name: "Name2" },
    ]);
  });

  it("returns followers of a specific user", async () => {
    Follow.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue([
        {
          followerId: {
            _id: "user1",
            nickname: "nick1",
            name: "Name1",
          },
        },
      ]),
    });

    const res = await request(app).get("/api/followers/user2");

    expect(res.status).toBe(200);
    expect(res.body.followers).toEqual([
      { id: "user1", nickname: "nick1", name: "Name1" },
    ]);
  });
});

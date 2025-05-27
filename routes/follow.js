import express from "express";
import mongoose from "mongoose";
import Follow from "../models/Follow.js";
import User from "../models/User.js";
import authenticateToken from "./middleware/authToken.js";

const router = express.Router();

router.use(authenticateToken);

// Follow
router.post("/follow", async (req, res) => {
  const followerId = mongoose.Types.ObjectId(req.user._id);
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ error: "Missing targetUserId" });
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ error: "Invalid userId format" });
  }

  const objectTargetId = mongoose.Types.ObjectId(targetUserId);

  if (followerId.toString() === objectTargetId.toString()) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  try {
    const alreadyFollowing = await Follow.findOne({
      followerId: followerId,
      targetUserId: objectTargetId,
    });

    if (alreadyFollowing) {
      return res.status(400).json({ error: "Already following this user" });
    }

    const newFollow = new Follow({
      followerId: followerId,
      targetUserId: objectTargetId,
    });
    await newFollow.save();

    await Promise.all([
      User.findByIdAndUpdate(followerId, {
        $addToSet: { following: objectTargetId },
      }),
      User.findByIdAndUpdate(objectTargetId, {
        $addToSet: { followers: followerId },
      }),
    ]);

    return res.status(201).json({ message: "Followed successfully" });
  } catch (error) {
    console.error("Follow route error:", error);
    return res.status(500).json({ error: error.message || "DB error" });
  }
});

// Unfollow
router.post("/unfollow", async (req, res) => {
  const followerId = mongoose.Types.ObjectId(req.user._id);
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ error: "Missing targetUserId" });
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ error: "Invalid userId format" });
  }

  const objectTargetId = mongoose.Types.ObjectId(targetUserId);

  try {
    const result = await Follow.findOneAndDelete({
      followerId,
      targetUserId: objectTargetId,
    });

    if (!result) {
      return res.status(404).json({ error: "Not following this user" });
    }

    await Promise.all([
      User.findByIdAndUpdate(followerId, {
        $pull: { following: objectTargetId },
      }),
      User.findByIdAndUpdate(objectTargetId, {
        $pull: { followers: followerId },
      }),
    ]);

    return res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    return res.status(500).json({ error: "DB error" });
  }
});

// Following list
router.get("/following", async (req, res) => {
  try {
    const userId = req.user._id;
    const objectUserId = mongoose.Types.ObjectId(userId);

    const following = await Follow.find({ followerId: objectUserId }).populate(
      "targetUserId",
      "nickname name"
    );

    const followingUsers = following.map((entry) => ({
      id: entry.targetUserId._id,
      nickname: entry.targetUserId.nickname,
      name: entry.targetUserId.name,
    }));

    res.status(200).json({ following: followingUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Followers of a specific user
router.get("/followers/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const objectUserId = mongoose.Types.ObjectId(userId);

    const followers = await Follow.find({
      targetUserId: objectUserId,
    }).populate("followerId", "nickname name");

    const followingUsers = followers.map((entry) => ({
      id: entry.followerId._id,
      nickname: entry.followerId.nickname,
      name: entry.followerId.name,
    }));

    res.status(200).json({ followers: followingUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

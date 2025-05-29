import express from "express";
import mongoose from "mongoose";
import Follow from "../models/Follow.js";
import authenticateToken from "./middleware/authToken.js";


const router = express.Router();

router.use(authenticateToken);

// Hjälpfunktion
function getValidObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId format");
  }
  return new mongoose.Types.ObjectId(id);
}

// Follow
router.post("/follow", async (req, res) => {
  try {
    const followerId = getValidObjectId(req.user._id);
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "Missing targetUserId" });
    }

    const objectTargetId = getValidObjectId(targetUserId);

    if (followerId.toString() === objectTargetId.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const alreadyFollowing = await Follow.findOne({
      followerId,
      targetUserId: objectTargetId,
    });

    if (alreadyFollowing) {
      return res.status(400).json({ error: "Already following this user" });
    }

    const newFollow = new Follow({
      followerId,
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
  try {
    const followerId = getValidObjectId(req.user._id);
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "Missing targetUserId" });
    }

    const objectTargetId = getValidObjectId(targetUserId);

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
    console.error("Unfollow route error:", error);
    return res.status(500).json({ error: error.message || "DB error" });
  }
});

// Following list
router.get("/following", async (req, res) => {
  try {
    const userId = getValidObjectId(req.user._id);

    const following = await Follow.find({ followerId: userId }).populate(
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
    const objectUserId = getValidObjectId(req.params.userId);

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

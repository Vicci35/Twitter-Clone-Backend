import express from "express";
import mongoose from "mongoose";
import Follow from "../models/Follow.js";
import User from "../models/User.js";
import authenticateToken from "./middleware/authToken.js";

const router = express.Router();

router.use(authenticateToken);

//Follow
router.post("/follow", async (req, res) => {
  const followerId = req.user._id;

  console.log(followerId);

  const { targetUserId } = req.body;
  console.log(targetUserId);

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ error: "Invalid userId format" });
  }

  const objectTargetId =
    mongoose.Types.ObjectId.createFromHexString(targetUserId);

  console.log(objectTargetId);
  if (!targetUserId) {
    return res.status(400).json({ error: "Missing targetUserId" });
  }

  if (followerId.toString() === objectTargetId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  try {
    const alreadyFollowing = await Follow.findOne({
      followerId,
      targetUserId: objectTargetId,
    });
    if (alreadyFollowing) {
      return res.status(400).json({ error: "Already following this user" });
    }

    const newFollow = new Follow({ followerId, targetUserId: objectTargetId });
    await newFollow.save();

    await Promise.all([
      User.findByIdAndUpdate(followerId, {
        $addToSet: { following: objectTargetId },
      }),

      User.findByIdAndUpdate(objectTargetId, {
        $addToSet: { followers: followerId },
      }),
    ]);

    console.log("SUCCESS");
    res.status(201).json({ message: "Followed successfully" });
  } catch (error) {
    console.log("FEL:", error);
    res.status(500).json({ error: error.message });
  }
});

//Unfollow
router.post("/unfollow", async (req, res) => {
  const followerId = req.user._id;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ error: "Missing followeeId" });
  }

  try {
    const result = await Follow.findOneAndDelete({ followerId, targetUserId });

    if (!result) {
      return res.status(404).json({ error: "Not following this user" });
    }

    res.status(200).json({ message: "Unfollowed succesfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Following
router.get("/following", async (req, res) => {
  try {
    const userId = req.user._id;

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

//Following a sertain user
router.get("/followers/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const followers = await Follow.find({ targetUserId: userId }).populate(
      "followerId",
      "nickname name"
    );

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

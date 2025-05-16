import express from "express";
import Follow from "../models/Follow.js";
import authenticateToken from "./middleware/authToken.js";

const router = express.Router();

router.use(authenticateToken);

//Follow
router.post("/follow", async (req, res) => {
  const followerId = req.user._id;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ error: "Missing targetUserId" });
  }

  if (followerId.toString() === targetUserId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  try {
    const alreadyFollowing = await Follow.findOne({ followerId, targetUserId });
    if (alreadyFollowing) {
      return res.status(400).json({ error: "Already following this user" });
    }

    const newFollow = new Follow({ followerId, targetUserId });
    await newFollow.save();

    res.status(201).json({ message: "Followed successfully" });
  } catch (error) {
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

    const followers = await Follow.find({ followeeId: userId }).populate(
      "targetUserId",
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

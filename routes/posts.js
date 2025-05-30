import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

//feed get all posts
router.get("/feed", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "nickname")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//feed posts only from followed users
router.get("/feed/following/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Uer not found" });
    }

    const idsToInclude = [...user.following, user._id];
    const posts = await Post.find({ author: { $in: idsToInclude } })
      .populate("author", "nickname")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//profile get posts
router.get("/user/:id", async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .populate("author", "nickname")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//create post
router.post("/", async (req, res) => {
  try {
    const { content, author } = req.body;

    if (!content || !author) {
      return res.status(400).json({ error: "Missing content or author" });
    }
    if (content.length > 140) {
      return res.status(400).json({ error: "Content exceeds 140 characters" });
    }
    const userExists = await User.findById(author);
    if (!userExists) {
      return res.status(404).json({ error: "Author not found" });
    }

    const newPost = new Post({
      content,
      author,
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate(
      "author",
      "nickname"
    );
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//search posts
router.get("/search", async (req, res) => {
  const { q } = req.query;

  try {
    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Sökfråga saknas" });
    }

    const posts = await Post.find({ content: { $regex: q, $options: "i" } })
      .populate("author", "nickname")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

router.get("/feed", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "nickname")
            .sort({ createdAt: -1 });
        
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router;
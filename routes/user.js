import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { 
            name, 
            password,
            email,
            nickname,
            about,
            hometown, 
            website, 
            occupation, 
        } = req.body;

        if (!name || !password || !email || !nickname) {
            return res.status(400).json({ error: "Missing required inputs" });
        };
        
        const existantMail = await User.findOne({ email });
        if (existantMail) {
            return res.status(409).json({message: "Email already in use!"})
        };
        const existantNick = await User.findOne({ nickname });
        if (existantNick) {
            return res.status(409).json({message: "Nickname already in use!"});
        };

        const newUser = new User({
            name, 
            password,
            email,
            nickname,
            about,
            hometown, 
            website, 
            occupation, 
        });

        newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

export default router;
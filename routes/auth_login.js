import express from "express";
import User from "../models/User.js";
import { comparePasswords } from "../services/auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Fel e-post." });

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Fel lösenord." });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverfel" });
  }
});

export default router;

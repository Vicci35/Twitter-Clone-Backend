import express from "express";
import User from "../models/User.js";
import { getHashedPassword } from "../services/auth.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: "Alla fält måste fyllas i." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "E-postadressen används redan." });
    }

    const hashedPassword = await getHashedPassword(password);
    const newUser = new User({ email, password: hashedPassword, nickname });

    await newUser.save();
    res.status(201).json({ userID: newUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Kunde inte skapa användare." });
  }
});

export default router;

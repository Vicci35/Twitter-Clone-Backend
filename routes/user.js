import express from "express";
import User from "../models/User.js";

import { getHashedPassword } from "../services/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  console.log("Loggas detta?");
  console.log(req.body);
  try {
    const { name, password, email, username, repeatPassword } = req.body;

    if (!name || !password || !email || !username) {
      return res.status(400).json({ inputError: "Missing required inputs" });
    }

    const existantMail = await User.findOne({ email });
    if (existantMail) {
      return res.status(409).json({ signupError: "Email already in use!" });
    }
    const existantNick = await User.findOne({ nickname: username });
    if (existantNick) {
      return res.status(409).json({ signupError: "Nickname already in use!" });
    }

    const hashedPassword = await getHashedPassword(password);

    //   Användare kan redigera tom information i settings senare
    const newUser = new User({
      name,
      password: hashedPassword,
      email,
      nickname: username,
      about: "",
      hometown: "",
      website: "",
      occupation: "",
    });

    newUser.save();

    res.status(201).json({ userSaved: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    //"-password" ensures that requests do not include the password
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

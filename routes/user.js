import express from "express";
import User from "../models/User.js";

import { getHashedPassword } from "../services/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    console.log("Loggas detta?");
    res.status(200).json({ msg: req.body });
  } catch (error) {
    console.log("... eller detta?");
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
  // try {
  //     const {
  //         name,
  //         password,
  //         email,
  //         nickname,
  //         about,
  //         hometown,
  //         website,
  //         occupation,
  //     } = req.body;

  //     if (!name || !password || !email || !nickname) {
  //         return res.status(400).json({ error: "Missing required inputs" });
  //     };

  //     const existantMail = await User.findOne({ email });
  //     if (existantMail) {
  //         return res.status(409).json({message: "Email already in use!"})
  //     };
  //     const existantNick = await User.findOne({ nickname });
  //     if (existantNick) {
  //         return res.status(409).json({message: "Nickname already in use!"});
  //     };

  //     const hashedPassword = await getHashedPassword(password);

  //     const newUser = new User({
  //         name,
  //         password: hashedPassword,
  //         email,
  //         nickname,
  //         about,
  //         hometown,
  //         website,
  //         occupation,
  //     });

  //     newUser.save();

  //     res.status(201).json({ message: "User registered successfully" });
  //     } catch (error) {
  //         res.status(500).json({ error: error.message });
  //     }
});

export default router;

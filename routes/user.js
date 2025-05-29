import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";

import { getHashedPassword } from "../services/auth.js";

const router = express.Router();

const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `profileImage-${Date.now()}${ext}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

router.post("/register", async (req, res) => {
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
      profileImage: "",
    });

    await newUser.save();

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

router.put("/update-info", async (req, res) => {
  try {
    const {
      id,
      changeName,
      changeNick,
      changeAbout,
      changeMail,
      changeOccupation,
      hometown,
      changeWebsite,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: changeName,
        nickname: changeNick,
        about: changeAbout,
        email: changeMail,
        occupation: changeOccupation,
        hometown: hometown,
        website: changeWebsite,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Updated profile image
router.put("/:id", upload.single("profileImage"), async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      nickname,
      email,
      about,
      occupation,
      website,
      hometown,
    } = req.body;

    const updateData = {
      name,
      nickname,
      email,
      about,
      occupation,
      website,
      hometown,
    };

    if (req.file) {
      updateData.profileImage = req.file.path.replace(/\\/g, "/"); 
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Hämta en användarprofil med ID
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Användare hittades inte." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Något gick fel." });
  }
});

export default router;
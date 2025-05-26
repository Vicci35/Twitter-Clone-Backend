import express from "express";
import User from "../models/User.js";
import authenticateToken from "./middleware/authToken.js";

const router = express.Router();

router.get("/profile/:id", authenticateToken, async (req, res) => {
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
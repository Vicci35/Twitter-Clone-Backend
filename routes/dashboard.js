import express from "express";
import authenticateToken from "./middleware/authToken.js";

const dashRouter = express.Router();

dashRouter.get("/", authenticateToken, (req, res) => {
  console.log(req.user);

  res.json({
    message: "Logged in",
    user: req.user,
  });
});

export default dashRouter;

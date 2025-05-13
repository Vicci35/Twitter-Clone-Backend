import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../../models/User.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Ingen token angiven" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Hämta användare från databasen, exkludera lösenordet
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Användare hittades inte" });
    }

    req.user = user; // Nu har du hela användaren i req.user
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Ogiltig token" });
  }
};

export default authenticateToken;

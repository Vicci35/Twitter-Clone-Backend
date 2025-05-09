import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, nest) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Ingen token angiven" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Ogiltig token" });
    }

    req.user = user;
    next();
  });
};

export default authenticateToken;

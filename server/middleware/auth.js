// middleware/auth.js
const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// Attach req.user from a valid Bearer JWT
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorised — no token provided" });
    }

    const token   = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Token expired — please log in again" : "Invalid token";
    return res.status(401).json({ success: false, message: msg });
  }
};

module.exports = { protect };
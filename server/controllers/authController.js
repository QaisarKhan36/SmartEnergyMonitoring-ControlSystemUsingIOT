// controllers/authController.js
const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// Sign a JWT for a given user id
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Send token + user in response
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ success: true, token, user });
};

// ── POST /api/auth/register ──────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "name, email and password are required" });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    user.password = undefined;
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/auth/profile ────────────────────────────────────────
// Updates profile fields from Settings.jsx → Profile tab
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "email", "phone", "timezone", "language",
                     "system", "appearance", "notifications",
                     "alertThreshold", "alertsEnabled", "monthlyBudget",
                     "tariffPlan", "flatRate"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/auth/password ───────────────────────────────────────
// Called from Settings.jsx → Security tab "Change Password"
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "currentPassword and newPassword are required" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/regenerate-key ────────────────────────────────
// Called from Settings.jsx → Security tab "Regenerate API Key"
exports.regenerateApiKey = async (req, res, next) => {
  try {
    const apiKey = "sk_live_" + Math.random().toString(36).slice(2, 22);
    await User.findByIdAndUpdate(req.user._id, { apiKey });
    res.json({ success: true, apiKey });
  } catch (err) {
    next(err);
  }
};
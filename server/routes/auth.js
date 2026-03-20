// routes/auth.js
const express = require("express");
const router  = express.Router();
const {
  register, login, getMe,
  updateProfile, changePassword, regenerateApiKey,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register",          register);
router.post("/login",             login);
router.get ("/me",                protect, getMe);
router.put ("/profile",           protect, updateProfile);
router.put ("/password",          protect, changePassword);
router.post("/regenerate-key",    protect, regenerateApiKey);

module.exports = router;
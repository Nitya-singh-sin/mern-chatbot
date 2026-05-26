const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Get all users (for online sidebar)
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("username avatar isOnline lastSeen")
      .sort({ isOnline: -1, username: 1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Update user theme
router.patch("/theme", protect, async (req, res) => {
  try {
    const { theme } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { theme }, { new: true });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update theme" });
  }
});

// Update profile
router.patch("/profile", protect, async (req, res) => {
  try {
    const { username } = req.body;
    const existing = await User.findOne({ username });
    if (existing && existing._id.toString() !== req.user.id) {
      return res.status(409).json({ message: "Username already taken" });
    }
    const user = await User.findByIdAndUpdate(req.user.id, { username }, { new: true });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;

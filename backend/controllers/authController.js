const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register new user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        message: existingUser.email === email ? "Email already in use" : "Username already taken",
      });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.isOnline = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: "Login successful!",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: false,
      lastSeen: new Date(),
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

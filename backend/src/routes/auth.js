// ── routes/auth.js ─────────────────────────────────────────
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const SALT_ROUNDS = 12;
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: "Missing required fields" });
    if (await User.findOne({ email })) return res.status(409).json({ error: "Email already registered" });
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ full_name, email, phone, password_hash });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.full_name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.is_active) return res.status(403).json({ error: "Account disabled" });
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.full_name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.full_name, email: req.user.email, role: req.user.role } });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent." });
    const token = crypto.randomBytes(32).toString("hex");
    user.reset_token = token;
    user.reset_token_expiry = Date.now() + 3600000; // 1 hour
    await user.save();
    // TODO: send email with reset link containing token
    res.json({ message: "Password reset link sent to your email." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ reset_token: token, reset_token_expiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: "Invalid or expired reset token" });
    user.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    user.reset_token = undefined;
    user.reset_token_expiry = undefined;
    await user.save();
    res.json({ message: "Password reset successful." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/auth/profile
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { full_name, phone }, { new: true }).select("-password_hash");
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

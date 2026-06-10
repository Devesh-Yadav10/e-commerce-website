// ── routes/admin.js ────────────────────────────────────────
const express = require("express");
const { User, Order, Product } = require("../models");
const { authenticate, isAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, isAdmin);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [users, orders, products] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Order.countDocuments(),
      Product.countDocuments({ is_active: true }),
    ]);
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } },
    ]);
    res.json({ users, orders, products, revenue: revenueAgg[0]?.total || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/orders
router.get("/orders", async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.order_id = { $regex: search, $options: "i" };
    const orders = await Order.find(query)
      .populate("user_id", "full_name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(query);
    res.json({ orders, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/orders/:id/status
router.put("/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: "user" };
    if (search) query.$or = [{ full_name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
    const users = await User.find(query).select("-password_hash").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ users, total: await User.countDocuments(query) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/users/:id/toggle
router.put("/users/:id/toggle", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.is_active = !user.is_active;
    await user.save();
    res.json({ message: `User ${user.is_active ? "enabled" : "disabled"}`, is_active: user.is_active });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

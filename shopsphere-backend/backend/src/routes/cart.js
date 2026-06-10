// ── routes/cart.js ─────────────────────────────────────────
const express = require("express");
const { Cart, Product } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/cart - get user cart populated with product details
router.get("/", authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id }).populate("items.product_id");
    res.json(cart || { items: [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/cart/add - add item or increase quantity
router.post("/add", authenticate, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ error: "Insufficient stock" });

    let cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) cart = await Cart.create({ user_id: req.user._id, items: [] });

    const existingItem = cart.items.find(i => i.product_id.toString() === product_id);
    if (existingItem) existingItem.quantity += quantity;
    else cart.items.push({ product_id, quantity });

    await cart.save();
    res.json(await cart.populate("items.product_id"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/cart/update/:productId - update quantity
router.put("/update/:productId", authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.find(i => i.product_id.toString() === req.params.productId);
    if (!item) return res.status(404).json({ error: "Item not in cart" });

    if (quantity <= 0) cart.items = cart.items.filter(i => i.product_id.toString() !== req.params.productId);
    else item.quantity = quantity;

    await cart.save();
    res.json(await cart.populate("items.product_id"));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/cart/remove/:productId
router.delete("/remove/:productId", authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    cart.items = cart.items.filter(i => i.product_id.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/cart/clear
router.delete("/clear", authenticate, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user_id: req.user._id }, { items: [] });
    res.json({ message: "Cart cleared" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

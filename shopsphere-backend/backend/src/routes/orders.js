// ── routes/orders.js ───────────────────────────────────────
const express = require("express");
const { Order, Cart, Product } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders - place order
router.post("/", authenticate, async (req, res) => {
  try {
    const { shipping_address, payment_method, items } = req.body;

    // Validate stock for each item
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product?.name || item.product_id}` });
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderProducts = [];
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      subtotal += product.price * item.quantity;
      orderProducts.push({ product_id: product._id, name: product.name, image: product.images[0], price: product.price, quantity: item.quantity });
      // Decrement stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }
    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal > 2000 ? 0 : 99;
    const total_amount = subtotal + tax + shipping;

    const order = await Order.create({
      user_id: req.user._id,
      products: orderProducts,
      shipping_address,
      subtotal,
      tax,
      shipping,
      total_amount,
      payment_method,
    });

    // Clear cart after successful order
    await Cart.findOneAndUpdate({ user_id: req.user._id }, { items: [] });

    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/orders - get user's orders
router.get("/", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/orders/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

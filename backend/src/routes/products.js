// ── routes/products.js ─────────────────────────────────────
const express = require("express");
const { Product } = require("../models");
const { authenticate, isAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/products  (public, supports ?search=&category=&sort=&page=&limit=)
router.get("/", async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 20 } = req.query;
    const query = { is_active: true };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;

    const sortMap = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      "name": { name: 1 },
      "newest": { createdAt: -1 },
    };

    const products = await Product.find(query)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);
    res.json({ products, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/products (admin)
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/products/:id (admin)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/products/:id (admin)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { is_active: false });
    res.json({ message: "Product removed" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

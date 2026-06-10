// ── routes/events.js ───────────────────────────────────────
const express = require("express");
const { Event } = require("../models");
const { authenticate, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ is_active: true }).sort({ order: 1, createdAt: -1 });
    res.json(events);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", authenticate, isAdmin, async (req, res) => {
  try { res.status(201).json(await Event.create(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ev) return res.status(404).json({ error: "Event not found" });
    res.json(ev);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try { await Event.findByIdAndDelete(req.params.id); res.json({ message: "Event deleted" }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

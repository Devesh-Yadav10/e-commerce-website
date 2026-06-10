// ── routes/upload.js ───────────────────────────────────────
// Cloudinary image upload — requires: npm i cloudinary multer multer-storage-cloudinary
const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { authenticate, isAdmin } = require("../middleware/auth");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "shopsphere",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/upload/image  (admin only, single image)
router.post("/image", authenticate, isAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });
  res.json({ url: req.file.path, public_id: req.file.filename });
});

// POST /api/upload/images  (admin only, up to 10 images)
router.post("/images", authenticate, isAdmin, upload.array("images", 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: "No files provided" });
  res.json({ urls: req.files.map(f => ({ url: f.path, public_id: f.filename })) });
});

module.exports = router;

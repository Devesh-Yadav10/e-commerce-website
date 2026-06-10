// ── utils/seed.js  ─  run once with: npm run seed ──────────
require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { User, Product, Event } = require("../models");

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected. Seeding…");

  // Admin user
  const adminPwd = await bcrypt.hash("Admin@1234", 12);
  await User.findOneAndUpdate(
    { email: "admin@shopsphere.in" },
    { full_name: "Admin", email: "admin@shopsphere.in", password_hash: adminPwd, role: "admin", is_active: true },
    { upsert: true }
  );
  console.log("✅  Admin user: admin@shopsphere.in / Admin@1234");

  // Sample events
  await Event.deleteMany({});
  await Event.insertMany([
    { title: "Summer Sale", description: "Up to 70% off", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400", redirect_url: "/products", order: 1 },
    { title: "Tech Edition", description: "Latest gadgets", image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400", redirect_url: "/products", order: 2 },
  ]);
  console.log("✅  Events seeded");

  // Sample products
  await Product.deleteMany({});
  await Product.insertMany([
    { name: "Wireless Headphones", category: "Electronics", description: "Premium audio", price: 2499, stock: 50, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"] },
    { name: "Leather Bag", category: "Fashion", description: "Full-grain leather", price: 3299, stock: 20, images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"] },
    { name: "Desk Lamp", category: "Home & Living", description: "Adjustable arm", price: 1899, stock: 60, images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"] },
  ]);
  console.log("✅  Products seeded");

  await mongoose.disconnect();
  console.log("Seeding complete.");
};

seed().catch(console.error);

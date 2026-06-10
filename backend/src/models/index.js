// ── User Model ─────────────────────────────────────────────
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: String,
    is_active: { type: Boolean, default: true },
    reset_token: String,
    reset_token_expiry: Date,
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password_hash);
};

const User = mongoose.model("User", userSchema);

// ── Product Model ───────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    is_active: { type: Boolean, default: true },
    tags: [String],
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: "text" });
const Product = mongoose.model("Product", productSchema);

// ── Event Model ─────────────────────────────────────────────
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    image: { type: String, required: true },
    redirect_url: { type: String, default: "/" },
    is_active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

// ── Cart Model ──────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

// ── Order Model ─────────────────────────────────────────────
const orderProductSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    order_id: { type: String, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [orderProductSchema],
    shipping_address: {
      full_name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      country: String,
      postal_code: String,
    },
    subtotal: Number,
    tax: Number,
    shipping: Number,
    total_amount: { type: Number, required: true },
    payment_method: String,
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Auto-generate order ID
orderSchema.pre("save", async function (next) {
  if (!this.order_id) {
    const count = await mongoose.model("Order").countDocuments();
    this.order_id = `ORD-${String(count + 1000).padStart(4, "0")}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = { User, Product, Event, Cart, Order };

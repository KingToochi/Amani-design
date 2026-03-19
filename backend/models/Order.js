// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "NGN",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed",
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerName: String,
  customerPhone: String,
  items: [{
    name: String,
    price: Number,
    quantity: Number,
  }],
  orderStatus: {
    type: String,
    default: "processing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);

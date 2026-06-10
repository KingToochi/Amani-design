// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number
    }
  ],
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
    enum: ["processing", "pending", "successful", "failed"],
    default: "processing",
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    required: true
  },
  customerPaymentId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    color: String,
    size: String,
  }],
  deliveryDate: {
    type: Date
  },
  orderStatus: {
    type: String,
    enum: ["pending","trucking", "delivered", "cancelled", "returned"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);

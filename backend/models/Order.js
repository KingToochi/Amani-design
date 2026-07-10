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
  subtotalAmount: {
    type: Number,
    default: 0,
  },
  paymentFee: {
    type: Number,
    default: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
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
    productId: String,
    status :  {
      type: String,
      enum: ["pending","confirmed", "unavailable", "in_transit", "delivered", "cancelled", "returned", "completed"],
      default: "pending",
    },
    availabilityConfirmed: {
      type: Boolean,
      default: false,
    },
    availability: {
      hasProduct: {
        type: Boolean,
        default: false,
      },
      fullQuantityAvailable: {
        type: Boolean,
        default: false,
      },
      availableQuantity: {
        type: Number,
        default: 0,
      },
      originalQuantity: {
        type: Number,
        default: 0,
      },
    },
    sentAt: {
      type: Date,
      default: null,
    },
  }],
  endorOrderQuantityDetails: [{
    itemId: String,
    productId: String,
    originalQuantity: Number,
    availableQuantity: Number,
    hasProduct: Boolean,
    fullQuantityAvailable: Boolean,
    itemStatus: String,
    confirmedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  deliveryDate: {
    type: Date
  },
  orderStatus: {
    type: String,
    enum: ["pending","partially_verified", "verified", "in_transit", "delivered", "completed", "cancelled", "returned"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);

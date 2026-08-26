import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    index: true,
  },
  orderNumber: {
    type: String,
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  complaint: {
    type: String,
    required: [true, "Complaint is required"],
    trim: true,
    minlength: [1, "Complaint must have at least 1 character"],
    maxlength: [5000, "Complaint cannot exceed 5000 characters"],
  },
  itemName: String,
  itemQuantity: Number,
  itemPrice: Number,
  itemColor: String,
  itemSize: String,
  status: {
    type: String,
    enum: ["open", "in_review", "resolved", "rejected"],
    default: "open",
    index: true,
  },
}, { timestamps: true });

complaintSchema.index({ customerId: 1, createdAt: -1 });

export default mongoose.model("Complaint", complaintSchema);
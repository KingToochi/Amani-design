import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, "Review must have at least 1 character"],
    maxlength: [5000, "Review cannot exceed 5000 characters"],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "deleted"],
    default: "approved",
    index: true,
  },
}, { timestamps: true });

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);

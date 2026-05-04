// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  designerId: { string, ref: "User", required: true },
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  productCategory: { type: String, required: true },
  productSubCategory: { type: String, required: true },
  basePrice: Number,
  baseColor: String,
  baseSize: String,
  productImages: [String], // Array of URLs
  variants: [{
    size: String,
    color: String,
    price: Number,
    stock: { type: Number, default: 0 }
  }],
  hasVariants: { type: Boolean, default: false }
}, { timestamps: true });


export default mongoose.model("Product", productSchema);

// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  DesignerId: String,
  productDescription: String,
  productCategory: String,
  productPrice: Number,
  color: String,
  size: String,
  productImage: String,
});

export default mongoose.model("Product", productSchema);

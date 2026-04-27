// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  designerId: String,
  productDescription: String,
  productName: String,
  productCategory: String,
  productPrice: Number,
  color: String,
  size: String,
  productImage: String,
  variants: [{
    varianSizeId: {type: String, required: true},
    VariantColorId:  {type: String, required: true},
    VariantPriceId:  {type: Number, required: true},
  }],
  hasVariants: { type: Boolean, default: false }
}, { timestamps: true });


export default mongoose.model("Product", productSchema);

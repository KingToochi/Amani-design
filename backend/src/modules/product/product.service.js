import Product from "../../models/Product.js";
import fs from "fs";
import cloudinary from "../../config/cloudinary.js";

export const fetchAllProducts = async() => {
    const products = await Product.find()
    return products
}

export const fetchProductById = async(productId) => {
    const product = await Product.findOne({_id : productId})
    return product
}

export const editProduct = async({productId, productDetails}) => {
    const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId },
        { $set: productDetails },
        { new: true }
    );

    return updatedProduct
}

export const deleteProduct = async({productId}) => {
    const deleted = await Product.findOneAndDelete({ _id: productId });
    if (!deleted) throw new Error("Product not found")
        return deleted
}

export const fetchVendorProducts = async (user) => {
    const products = await Product.find({vendorId : user._id})
    if (!products || products.length === 0) {
        throw new Error("no product found, click add product link to add more products")
    }

    return products
}

export const createNewProduct = async({files, body, vendorId}) => {
    let productImageUrls = [];
          
        if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
            const cloudRes = await cloudinary.uploader.upload(file.path, {
            folder: "my_website_products",
            });
            // Remove temp file
            fs.unlink(file.path, () => {});
            return cloudRes.secure_url;
        });
        
        productImageUrls = await Promise.all(uploadPromises);
        }

        const {
            productDescription,
            productName,
            productCategory,
            productSubCategory,
            productPrice,
            color,
            size
        } = body;

        // 5️⃣ Extract variants from form data
      const variants = [];
      const variantKeys = Object.keys(body).filter(key => 
        key.match(/^(size|color|price)\d+$/)
      );
      
      // Group variants by index
      const variantMap = new Map();
      variantKeys.forEach(key => {
        const match = key.match(/(size|color|price)(\d+)/);
        if (match) {
          const [, type, index] = match;
          if (!variantMap.has(index)) {
            variantMap.set(index, {});
          }
          variantMap.get(index)[type] = body[key];
        }
      });
      // Convert map to array
            variantMap.forEach((variant, index) => {
              if (variant.size && variant.color && variant.price) {
                variants.push({
                  size: variant.size,
                  color: variant.color,
                  price: Number(variant.price),
                  stock: 0
                });
              }
            });
      
            console.log("Extracted Variants:", variants);
      
            // 6️⃣ Save product with variants and multiple images
            const newProduct = new Product({
              vendorId,
              productDescription,
              productName,
              productCategory,
              productSubCategory,
              basePrice: productPrice ? Number(productPrice) : null,
              baseColor: color,
              baseSize: size,
              productImages: productImageUrls, // Store as array
              variants: variants.length > 0 ? variants : [],
              hasVariants: variants.length > 0
            });
      
            await newProduct.save();

            return newProduct


}
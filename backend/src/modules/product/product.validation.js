import User from "../../models/User.js"
import Product from "../../models/Product.js"

export const userValidation = async(auth) => {
        const user = await User.findById(auth._id)
        if (!user) {
            throw new Error("user not found")
        }
        if (user.role !== "vendor") {
            throw new Error("Access denied. Only vendors can view their products." )
        }

        return user

}

export const userPutAndDeleteAuthorisation = async(productId, user) => {
    const product = await Product.findById(productId).select("vendorId")
    const vendorId = product.vendorId
    if(vendorId.toString() !== user._id.toString()) {
        throw new Error("unauthorized")
    }
    return
}

export const productValidation = async(product) => {
    if (!product) throw new Error("product not found")
    return product
}

export const validatePostProduct = ( {
        productDescription,
        productName,
        productCategory,
        productSubCategory,
        productPrice, 
        color,        
        size,       
      }) => {
      // Validate required base fields
      if (!productDescription || !productName || !productCategory || !productSubCategory) {
        const error = new Error("productDescription, productName, productCategory, and productSubCategory are required")
        error.statusCode = 400
        throw error
      }
      return
}
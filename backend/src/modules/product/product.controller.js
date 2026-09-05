import { fetchAllProducts } from "./product.service.js"
import { fetchVendorProducts } from "./product.service.js"
import { userValidation } from "./product.validation.js"
import { fetchProductById } from "./product.service.js"
import { productValidation } from "./product.validation.js"
import { editProduct as editProductService } from "./product.service.js"
import { userPutAndDeleteAuthorisation } from "./product.validation.js"
import { deleteProduct as removeProduct } from "./product.service.js"
import { validatePostProduct } from "./product.validation.js"
import { createNewProduct } from "./product.service.js"


export const getVendorProducts = async(req, res, next) => {
    try {
        const auth = req.user
        const user = await userValidation(auth)
        const products = await fetchVendorProducts(user)

        return res.status(200).json({
            success : true,
            products : products
        })


    }catch(error){
        console.log(error)
        next(error)
}

}

export const getProductById = async(req, res, next) => {
    try {
        const productId = req.params._id
        const product = await fetchProductById(productId)
        const validatedProduct = await productValidation(product)
        return res.status(200).json({
            validatedProduct
        })

    } catch(error) {
        next(error)
    }
}

export const editProduct = async(req, res, next) => {
    try {
        const auth = req.user
        const productDetails = req.body
        const productId = req.params.id
        const user = await userValidation(auth)
        const validatedUser = await userPutAndDeleteAuthorisation(productId, user)
        const product = await editProductService({productDetails, productId})
        const validatedProduct = await productValidation(product)
        return res.status(200).json({
            updatedProduct : validatedProduct
        })
    }catch(error) {
        next(error)
    }

}

export const deleteProduct = async(req,res, next) => {
    const productId = req.params.id
    const auth = req.user
    const user = await userValidation(auth)
    const validatedUser = await userPutAndDeleteAuthorisation(productId, user)
    const removeProduct = await removeProduct(productId)

}

export const postProduct = async(req, res, next) => {
    try {
        const auth = req.user
        const vendorId = auth._id;
           // 3️⃣ Extract base fields
        const {
            productDescription,
            productName,
            productCategory,
            productSubCategory,
            productPrice,  // Base price
            color,        // Base color
            size,         // Base size
        } = req.body;
        const body = req.body
        const files = req.files
        const validate = validatePostProduct({productDescription,
            productName,
            productCategory,
            productSubCategory,
            productPrice, 
            color,        
            size,} ) 
        const newProduct =  await createNewProduct(files, body)
        res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
      });
            
    }catch(error) {
        next(error)
    }
}

const getAllProducts = async(req, res, next) =>{
    try {
        const products = await fetchAllProducts()
        res.status(200).json({
            success: true,
            products
        })
    }catch(error) {
        console.log(error)
        next(error)
    }
}  

export default getAllProducts
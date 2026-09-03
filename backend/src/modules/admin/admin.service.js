import User from "../../models/User.js"
import Product from "../../models/Product.js"
import { validateAdmin } from "./admin.validation.js"


export const fetchAdmin = async(auth) => {
    const user = await User.findOne({_id: auth._id})
    const validate = validateAdmin(user)

    const adminDetails = {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      profilePicture: user.profilePicture,
      joinedAt: user.joinedAt,
    }

    return adminDetails
    
} 
export const fetchVendorDetails = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const vendors = await User.find({role: "vendor"}).select("id fname lname username email phoneNumber typeOfVendor status subscriber subscriptionDetails.plan subscriptionDetails.status joinedAt")
     return vendors
}

export const fetchCustomerDetails = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const customers = await User.find({role: "user"}).select("id fname lname username dob email phoneNumber joinedAt")
     return customers
}

export const fetchProducts = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const products = await Product.find()
         .select("_id vendorId productName")
         .sort({_id: -1})
     return products
}

export const fetchOrders = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const totalOrder = await Order.aggregate([
           {
             $project: {
               orderNumber: 1,
               amount: 1,
               currency: 1,
               paymentStatus: 1,
               customerName: 1,
               customerEmail: 1,
               customerPhone: 1,
               orderStatus: 1,
               createdAt: 1,
               items: 1,
               products: 1,
             },
           },
           {
             $group: {
               _id: "$orderStatus",
               count: { $sum: 1 },
               orders: { $push: "$$ROOT" },
             },
           },
           {
             $sort: { _id: 1 },
           },
         ])
     return totalOrder
}

export const fetchProductDetailsById = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const product = await Product.findOne({_id: req.params.id}).populate("vendorId", "fname lname username email")
     if (!product) {
      const  error = new Error("Product not found")
      error.statusCode = 404
     } 
     return product
}


export const fetchVendorDetailsById = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const vendor = await User.findOne({_id: req.params.id})
     if (!vendor) {
      const  error = new Error("vendor not found")
      error.statusCode = 404
     } 
     return vendor
}
 
export const fetchCustomerDetailsById = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const customer = await User.findOne({_id: req.params.id})
     if (!customer) {
      const  error = new Error("vendor not found")
      error.statusCode = 404
     } 
     return customer
}
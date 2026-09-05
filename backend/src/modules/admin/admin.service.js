import User from "../../models/User.js"
import Product from "../../models/Product.js"
import { validateAdmin } from "./admin.validation.js"
import bcrypt from "bcryptjs";
import {generateToken} from "../../utils/generateToken.js"
import { getCookieOptions } from "../../utils/getCookieOptions.js";



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

export const loginAdmin = async({email, password}) => {
   const loginIdentifier = String(email).trim().toLowerCase();
      const user = await User.findOne({ $or: [{ email: loginIdentifier }, { username: loginIdentifier }] });
      const validate = validateAdmin(user)
      const hashedPassword = user.password
      console.log(hashedPassword)
      console.log(password)
      console.log(user)
      const ismatch = bcrypt.compare(password, hashedPassword)
      if (!ismatch){
        const error = new Error("Incorrect password")
        error.statusCode = 401
        throw error
      } 
      const accessToken = await generateToken(loginIdentifier, { expiresIn: "15m" })
      const refreshToken = await generateToken(loginIdentifier, { expiresIn: "7d" })
  
      // Set access token in HTTP-only cookie
      res.cookie("accessToken", accessToken, getCookieOptions(req, {
        maxAge: 15 * 60 * 1000  // 15 minutes
      }));
  
      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
        path: "/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
      }));
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
export const fetchDataAnalytics = async(auth) => {
     const user = await User.findOne({_id: auth._id});
     const validate = validateAdmin(user);
     const totalUsers = await User.countDocuments();
       const totalSales = await Sales.countDocuments();
       const totalOrders = await Order.countDocuments();
       const totalProducts = await Product.countDocuments();
       const pendingApprovals = await User.countDocuments({role: "vendor", status: "pending"})
       const pendingOrders = await Order.countDocuments({orderStatus: "pending"})
       const deliveredOrders = await Order.countDocuments({orderStatus: "delivered"})
       const topBuyer = await User.aggregate([
       {
         $match: { role: "user" }
       },
     
       {
         $lookup: {
           from: "orders",
           localField: "_id",
           foreignField: "customerId",
           as: "productOrdered"
         }
       },
     
       {
       $unwind: {
         path: "$productOrdered",
         preserveNullAndEmptyArrays: true
       }
     },
     
       {
         $group: {
           _id: "$_id",
           name: {
                 $first: {
                 $concat: ["$fname", " ", "$lname"]
                 }
              },
           totalPurchases: { $sum: "$productOrdered.amount" }
         }
       },
     
       {
         $sort: { totalPurchases: -1 }
       },
     
       {
         $limit: 1
       }
     ]);
     
       const topSeller = await User.aggregate([
         {
           $match : { role: "vendor" } 
         },
         {
           $lookup : {
             from: "products",
             localField: "_id",
             foreignField: "vendorId",
             as: "vendorProducts"
           }
         },
          {
         $unwind: {
           path: "$vendorProducts",
           preserveNullAndEmptyArrays: true
           }
         },
     
           {
             $lookup : {
               from: "sales",
               localField: "vendorProducts._id",
               foreignField: "productId",
               as: "productSales"
             }
           },
     
           {
             $group: {
               _id: "$_id",
               name: {
                 $first: {
                 $concat: ["$fname", " ", "$lname"]
                 }
              },
               totalSales: { $sum: { $size: "$productSales" } }
             }
           },
     
           {
             $sort: { totalSales: -1 }
           },
     
           {
             $limit: 1
           }
           
       ])

           return { totalUsers, totalSales, totalOrders, totalProducts, topSeller, topBuyer, pendingApprovals, pendingOrders, deliveredOrders }
}
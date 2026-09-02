import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Likes from "./models/Likes.js";
import Comments from "./models/Comment.js";
import Sales from "./models/Sales.js";
import Orders from "./models/Order.js"
import bcrypt from "bcryptjs";
import Rating from "./models/Rating.js";
import Complaint from "./models/Complaint.js";
import cookieParser from "cookie-parser";
import Order from "./models/Order.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import calculateAmount from "./utils/calculateAmount.js";
import paystackInitialization from "./integrations/paystack/initialize.js";
import verifyPaystackPayment from "./integrations/paystack/verify.js"
import errorMidlleware from "./middleware/error.middleware.js"
import productRoute from "./modules/product/product.route.js"
import categoryRoute from "./modules/categories/category.route.js"
import designerProductRoute from "./modules/designerProducts/designerProduct.route.js"
import userRoute from "./modules/users/users.route.js"
import likesRoute from "./modules/likes/like.route.js"
import {parseBooleanFlag} from "./utils/booleanFlag.js"
import { allowedOrigins } from "./utils/allowedOrigin.js";
import { getCookieOptions } from "./utils/getCookieOptions.js";
import refreshToken from "./modules/refresh/refresh.route.js"



dotenv.config();
const app = express();
// Configure CORS to accept credentials from the live frontend domain and local development
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());
connectDB();
app.use(errorMidlleware)

const JWT_SECRET  = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === "production";
const clientId = process.env.FLW_CLIENT_ID;
const clientSecret = process.env.FLW_CLIENT_SECRET;
const encryptionKey = process.env.FLW_ENCRYPTION_KEY;

// ---- Socket.IO Setup ----
const server = http.createServer(app);

const verifyToken = async(req, res, next) => {
  let token;
  console.log("Cookies:", req.cookies);
  
  // Try to get token from Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } 
  else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token", err });
  }
};


// ---- Cloudinary ----
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.use("/products", productRoute)
app.use("/categories", categoryRoute)
app.use("/users", userRoute)
app.use("/likes", likesRoute)
app.use("/refresh", refreshToken)

app.get("/search", async (req, res) => {
  try {
    const { q } = req.query
    console.log(q)
    if (!q || !q.trim()) return res.json({ message: "empty field", products: [] })

    // Split input into words
    const inputValue = q.trim().split(/\s+/)
    console.log(inputValue)

    // Build MongoDB query: each word should match at least one field
    const mongoQuery = {
      $and: inputValue.map(word => ({
        $or: [
          { productCategory: { $regex: word, $options: "i" } },
          { productDescription: { $regex: word, $options: "i" } },
          {color: { $regex: word, $options: "i" }},
          {size: {$regex: word, $options: "i"}}
        ]
      }))
    }

    // Query MongoDB
    const products = await Product.find(mongoQuery)
    // Send results
    res.json({success:true, products })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/admin/details", verifyToken, async(req, res) => {
  const auth = req.user

  try {
    const user = await User.findOne({_id: auth._id})

    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const adminDetails = {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      profilePicture: user.profilePicture,
      joinedAt: user.joinedAt,
    }

    return res.json({ success: true, admin: adminDetails })

  } catch(error){
    console.error("Error fetching admin details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
})


app.get("/data", verifyToken, async(req, res) => {
  const auth = req.user

  try {
    const user = await User.findOne({_id: auth._id});
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
  
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
    return res.json({success: true, totalUsers, totalSales, totalOrders, totalProducts, topSeller, topBuyer, pendingApprovals, pendingOrders, deliveredOrders})

  }catch(error){
      return res.json({success: false, message: "An error occurred while fetching data", error})
  }

})

app.get("/admin/vendors", verifyToken, async(req, res) => {
  const auth = req.user

  const user = await User.findOne({_id: auth._id})
  if (!user || user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const vendors = await User.find({role: "vendor"}).select("id fname lname username email phoneNumber typeOfVendor status subscriber subscriptionDetails.plan subscriptionDetails.status joinedAt")

    return res.json({ success: true, vendors });
  }catch(error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server error", error });
  }

})

app.get("/admin/customers", verifyToken, async(req, res) => {
  const auth = req.user

  const user = await User.findOne({_id: auth._id})
  if (!user || user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const customers = await User.find({role: "user"}).select("id fname lname username dob email phoneNumber joinedAt")
    return res.json({ success: true, customers });
  }catch(error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server error", error });
  }
})

app.get("/admin/products", verifyToken, async(req, res) => {
  const auth = req.user
  const user = await User.findOne({_id: auth._id})
  if (!user || user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const products = await Product.find()
    .select("_id vendorId productName")
    .sort({_id: -1})
    return res.json({ success: true, products });
  }catch(error){
    console.log(error)
    res.status(500).json({ success: false, message: "Server error", error });
  }
})

app.get("/admin/orders", verifyToken, async(req, res) => {
  const auth = req.user
  const user = await User.findOne({_id: auth._id})
  if (!user || user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
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

    return res.json({
      success: true,
      totalOrder,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    })
  }
})

app.get("/orders", verifyToken, async(req, res) => {
  const auth = req.user;
  try {
    const user = await User.findById({_id : auth._id}).select("_id role")

    //  check if the user exist

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // check if the user is a vendor
    if (user.role !== "vendor") {
      return res.status(403).json({
         success: false,
        message: "Access denied"
      })
    }

    // get the orders of product link to the user
    const products = await Product.find({vendorId : user._id}).select("_id");

    // get the product Id
    const productIds = products.map((item) => item._id.toString());
    let totalOrder;

    if (productIds.length === 0) {
        return res.json({
          success: true,
          message: "No products found for this vendor",
          totalOrder: [],
        });
      }

    // get the list of orders of each product
    totalOrder = await Order.aggregate([
      {
        $match: {
          $or: [
            { "products.productId": { $in: productIds } },
            { "items.productId": { $in: productIds } },
          ],
        },
      },

      {
        $project: {
          products: {
            $filter: {
              input: "$products",
              as: "product",
              cond: {
                $in: ["$$product.productId", productIds],
              },
            },
          },
          amount: 1,
          orderStatus: 1,
          createdAt: 1,
          paymentStatus: 1,
          currency: 1,
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: {
                $in: ["$$item.productId", productIds],
              },
            },
          },
        },
      },

      {
    $group: {
      _id: "$orderStatus",
      count: { $sum: 1 },
      orders: { $push: "$$ROOT" }
    }
  }
    ])

    return res.json({
        success: true,
        totalOrder
      });

  }catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
})


app.get("/sales", verifyToken, async(req, res) => {
  const auth = req.user;
  try {
    const user = await User.findById({_id : auth._id}).select("_id role")

    //  check if the user exist

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // check if the user is a vendor
    if (user.role !== "vendor") {
      return res.status(403).json({
         success: false,
        message: "Access denied"
      })
    }

    // get the orders of product link to the user
    const products = await Product.find({vendorId : user._Id})

    // get the product Id

    const productIds = products.map((items) => items._id)
    let  totalSales;

    if (productIds.length === 0) {
        return res.json({
          success: true,
          message: "No products found for this vendor",
          totalSales: [],
        });
      }

    // get the list of orders of each product
    totalSales = await Sales.aggregate([
      {
        $match :{ 
          productId : {$in : productIds}}
      },

      {
        $project :{
          productId :1,
          productName: 1,
          quantity: 1,
          totalAmount: 1,
          tax: 1,
          finalAmount: 1,
          createdAt: 1,
          currency: 1,
        }
      },

      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$productId",
          totalSales: { $sum: "$quantity" },
          totalRevenue: { $sum: "$finalAmount" },
        }
      }
    ])

    return res.json({
        success: true,
        totalSales
      });

  }catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
})

app.get("/viewProduct/:id", verifyToken, async(req, res) => {
  const auth = req.user
  const user = await User.findOne({_id: auth._id})
  if (!user || user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  try {
    const product = await Product.findOne({_id: req.params.id}).populate("vendorId", "fname lname username email")
    if (!product) return res.status(404).json({ success: false, message: "Product not found" })
    return res.json({ success: true, product });
  } catch(error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server error", error });
  }
})

app.get("/viewVendor/:id", verifyToken, async(req, res) => {
  const auth = req.user
  const user = await User.findOne({_id: auth._id})
  if (!user || user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  try {
    const vendor = await User.findOne({_id: req.params.id})
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" })
    return res.json({ success: true, vendor });
  } catch(error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server error", error });
  }
})

app.get("/viewCustomer/:id", verifyToken, async(req, res) => {
  const auth = req.user
  const user = await User.findOne({_id: auth._id})
  if (!user || user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  try {
    const customer = await User.findOne({_id: req.params.id})
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" })
    return res.json({ success: true, customer });
  } catch(error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server error", error });
  }
})

app.get("/designer/productAnalytics", verifyToken, async (req, res) => {
  try {
    const auth = req.user;

    const user = await User.findById(auth._id).select("_id role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // get all vendor products
    const products = await Product.find(
      { vendorId: user._id },
      { _id: 1 }
    );

    const productIds = products.map(item => item._id);

    if (productIds.length === 0) {
      return res.json({
        success: true,
        sales: {
          totalSales: 0,
          totalRevenue: 0
        },
        orders: {
          totalOrders: 0
        },
        comments: {
          totalComments: 0
        },
        ratings: {
          totalRatings: 0,
          averageRating: 0
        }
      });
    }

    const [
      salesData,
      ordersData,
      commentsData,
      ratingsData
    ] = await Promise.all([

      // SALES
      Sales.aggregate([
        {
          $match: {
            productId: { $in: productIds }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: "$amount" }
          }
        }
      ]),

      // ORDERS
      Orders.aggregate([
        {
          $match: {
            "products.productId": { $in: productIds }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 }
          }
        }
      ]),

      // COMMENTS
      Comments.aggregate([
        {
          $match: {
            targetId: { $in: productIds }
          }
        },
        {
          $group: {
            _id: null,
            totalComments: { $sum: 1 }
          }
        }
      ]),

      // RATINGS
      Rating.aggregate([
        {
          $match: {
            productId: { $in: productIds }
          }
        },
        {
          $group: {
            _id: null,
            totalRatings: { $sum: 1 },
            averageRating: { $avg: "$rating" }
          }
        }
      ])
    ]);

    res.json({
      success: true,

      sales: salesData[0] || {
        totalSales: 0,
        totalRevenue: 0
      },

      orders: ordersData[0] || {
        totalOrders: 0
      },

      comments: commentsData[0] || {
        totalComments: 0
      },

      ratings: ratingsData[0] || {
        totalRatings: 0,
        averageRating: 0
      }
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get(
  "/designer/vendorProductAnalytics",
  verifyToken,
  async (req, res) => {
    const auth = req.user;

    try {
      // check user
      const user = await User.findById(auth._id).select("_id role");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // check role
      if (user.role !== "vendor") {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // vendor products
      const vendorProducts = await Product.find({
        vendorId: auth._id,
      }).sort({ createdAt: -1 });

      const productIds = vendorProducts.map(
        (item) => item._id
      );

      // no products
      if (productIds.length === 0) {
        return res.json({
          success: true,
          message: "No products found for this vendor",
          data: [],
        });
      }

      // analytics
      const [
        sales,
        orders,
        comments,
        ratings,
        likes,
      ] = await Promise.all([
        Sales.aggregate([
          {
            $match: {
              productId: { $in: productIds },
            },
          },
        ]),

        Orders.aggregate([
          {
            $match: {
              "products.productId": {
                $in: productIds,
              },
            },
          },
        ]),

        Comments.aggregate([
          {
            $match: {
              targetId: { $in: productIds },
            },
          },
        ]),

        Rating.aggregate([
          {
            $match: {
              productId: { $in: productIds },
            },
          },
        ]),

        Likes.aggregate([
          {
            $match: {
              productId: { $in: productIds },
            },
          },
        ]),
      ]);

      return res.json({
        success: true,
        analytics: {
          sales,
          orders,
          comments,
          ratings,
          likes,
        },
      });

    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

app.post("/initiatePayment", verifyToken, async (req, res) => {
    try {
        const { email, cart } = req.body;

        const initPaystack = await paystackInitialization(
            email,
            cart
        );

        if (!initPaystack.status) {
          return res.status(400).json({
            success : false,
            message : "payment Failed",
            data : initPaystack
          })
        }

        return res.status(200).json({
            success: true,
            message: "Payment initialized successfully",
            data: initPaystack
        });

    } catch (error) {
        console.error(
            "Payment initialization error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message || "Payment initialization failed"
        });
    }
});

app.post("/verifyPayment", verifyToken, async (req, res) => {
    try {
        const auth = req.user
        const user = await User.findById(auth._id)
          if (!user) {
          return res.status(404).json({
          success: false,
          message: "User not found"
        });
}
        const { reference, cart } = req.body;

        const verifiedPayment = await verifyPaystackPayment(reference);
        const calculatedAmount = await calculateAmount(cart)


        if (verifiedPayment.status !== "success") {
          return res.status(400).json({
            success : false,
            message: "unable to verify payment"
          })
        }

        const calculatedAmountInKobo = Math.round(Number(calculatedAmount) * 100);
        console.log(calculatedAmountInKobo)
        console.log(verifiedPayment.requested_amount)

        if ( Number(calculatedAmountInKobo) !== Number(verifiedPayment.requested_amount)) {
          return res.status(400).json({
            success : false,
            message: "Amount paid not equal to total amount"
          })
        }

  

        const products = cart.map(product => ({
          productId: product._id,
          quantity: product.quantity
        }));
        const cartItems = cart.map(product => ({
          id: product.itemId,
          name: product.productName,
          quantity: product.quantity,
          color: product.selectedColor,
          size: product.selectedSize,
          price: product.productPrice,
          productId: product._id,
        }))

        const newOrder = new Order({
          orderNumber : `Amanisky-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
          products : products,
          transactionId : verifiedPayment.id,
          amount : Number(verifiedPayment.requested_amount) / 100,
          subtotalAmount : Number(verifiedPayment.requested_amount) / 100,
          paymentFee : Number(verifiedPayment.fees) / 100,
          amountPaid : Number(verifiedPayment.amount) / 100,
          paymentStatus : "successful",
          paymentReference : verifiedPayment.reference,
          customerEmail : user.email,
          customerId : user._id,
          customerPaymentId : verifiedPayment.customer.id,
          customerName: `${user.fname} ${user.lname}`,
          customerPhone : user.phoneNumber,
          items : cartItems,
        })

        await newOrder.save()
    

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: verifiedPayment,
            newOrder
        });

    } catch (error) {
        console.error(
            "Payment verification error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message || "Payment verification failed"
        });
    }
});

// app.post("/createFlutterwaveCustomer", verifyToken, async (req, res) => {
//     try {
//         console.log("Create customer request body:", req.body);

//         const {
//             paymentMethod,
//             email,
//             fname,
//             lname,
//             shippingAddress,
//             city,
//             state,
//             phoneNumber,
//         } = req.body;

//         // Validate payment method
//         if (!paymentMethod) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment method is required",
//             });
//         }

//         // Validate customer information
//         if (
//             !email ||
//             !fname ||
//             !lname ||
//             !shippingAddress ||
//             !city ||
//             !state ||
//             !phoneNumber
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing required customer information",
//             });
//         }

//         const formattedPhone = phoneNumber.startsWith("0")
//             ? phoneNumber.substring(1)
//             : phoneNumber;

//         const accessToken = await getAccessToken();

//         let flutterwaveCustomer = null;

//         /*
//          * 1. Search for existing customer
//          */
//         const searchResponse = await axios.post(
//             "https://developersandbox-api.flutterwave.com/customers/search",
//             {
//                 email,
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         const customers = searchResponse.data?.data;

//         if (Array.isArray(customers) && customers.length > 0) {
//             flutterwaveCustomer = customers[0];

//             console.log(
//                 "Existing Flutterwave customer found:",
//                 flutterwaveCustomer
//             );
//         }

//         /*
//          * 2. Create customer only if one doesn't exist
//          */
//         if (!flutterwaveCustomer) {

//             const idempotencyKey = uuidv4().replace(/-/g, "");

//             const createResponse = await axios.post(
//                 "https://developersandbox-api.flutterwave.com/customers",
//                 {
//                     email,

//                     name: {
//                         first: fname,
//                         last: lname,
//                     },

//                     address: {
//                         line1: shippingAddress,
//                         city,
//                         state,
//                         country: "NG",
//                         postal_code: "480252",
//                     },

//                     phone: {
//                         country_code: "234",
//                         number: formattedPhone,
//                     },
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                         "X-Idempotency-Key": idempotencyKey,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );

//             flutterwaveCustomer = createResponse.data?.data;

//             console.log(
//                 "Flutterwave customer created:",
//                 flutterwaveCustomer?.id
//             );
//         }

//         /*
//          * 3. Information needed later for payment
//          */
//         const paymentInfo = {
//             email,
//             fname,
//             lname,
//             shippingAddress,
//             city,
//             state,
//             phoneNumber,
//             paymentMethod,
//         };

//         return res.status(200).json({
//             success: true,
//             message: "Customer ready",
//             data: flutterwaveCustomer,
//             paymentInfo,
//         });

//     } catch (error) {

//         console.error(
//             "Create customer error:",
//             error.response?.data || error.message
//         );

//         return res.status(error.response?.status || 500).json({
//             success: false,
//             message:
//                 error.response?.data?.error?.message ||
//                 error.response?.data?.message ||
//                 error.message ||
//                 "Unable to create Flutterwave customer",

//             error: error.response?.data || null,
//         });
//     }
// });


// app.post("/verifyPayment", verifyToken, async(req, res) => {
//   const auth = req.user
//   console.log(auth)
//   try {
//     const { transaction_id, cart, currency, amount, merchantAmount, paymentFee } = req.body;
//     console.log("Verify payment request body:", req.body);
//     console.log(cart)
//     if (!transaction_id) {
//       return res.status(400).json({
//         success: false,
//         message: "transaction_id is required"
//       });
//     }
//     const user = await User.findOne({_id : auth._id})

//     const existingTransaction = await Order.findOne({transactionId: transaction_id})
//     if (existingTransaction) {
//       return res.status(409).json({
//       success: false,
//       message: "Transaction already processed"
//       });
//     }

//     const accessToken = await getAccessToken();

//     const verificationResponse = await axios({
//       method: "get",
//       url: `https://api.flutterwave.com/v4/transactions/${transaction_id}/verify`,
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json"
//       }
//     });

//     const verification = verificationResponse.data;

//     if (
//       verification.status !== "success" ||
//       verification.data.status !== "successful"
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment verification failed"
//       });
//     }

//     const normalizedAmount = Number(amount || 0);
//     const normalizedMerchantAmount = Number(merchantAmount || 0);
//     const normalizedPaymentFee = Number(paymentFee || 0);
//     const expectedAmount = Number((normalizedMerchantAmount + normalizedPaymentFee).toFixed(2));

//     if (Number(verification.data.amount) !== normalizedAmount || Number(verification.data.amount) !== expectedAmount) {
//       return res.status(400).json({
//       success: false,
//       message: "Amount mismatch"
//       });
//     }
//     const rawEmail = verification.data.customer.email;
//     // Handle case where email might not have the prefix
//     const cleanEmail = rawEmail.includes('_') 
//       ? rawEmail.split('_').pop() 
//       : rawEmail;


//     const products = cart.map(product => ({
//       productId: product._id,
//       quantity: product.quantity
//     }));
//     const cartItems = cart.map(product => ({
//       id: product.itemId,
//       name: product.productName,
//       quantity: product.quantity,
//       color: product.selectedColor,
//       size: product.selectedSize,
//       price: product.productPrice,
//       productId: product._id,
//     }))

//     const newOrder = new Order({
//       orderNumber: `Amanisky-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
//       products: products,
//       transactionId: transaction_id,
//       amount: verification.data.amount,
//       subtotalAmount: normalizedMerchantAmount || Number(verification.data.amount),
//       paymentFee: normalizedPaymentFee || 0,
//       amountPaid: verification.data.amount,
//       currency: verification.data.currency,
//       paymentStatus: verification.data.status,
//       customerEmail: cleanEmail,
//       customerId : user?._id,
//       customerPaymentId: verification.data.customer.id,
//       customerName: verification.data.customer.name,
//       customerPhone: verification.data.customer.phone_number,
//       items: cartItems,
//     })

//     await newOrder.save()

//     return res.status(200).json({
//       success: true,
//       verification,
//       message: "Order saved successfully",
//       newOrder,
//       user
//     });

//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//       user
//     });
//   }
// });

// app.post("/paymentFee", verifyToken, async (req, res) => {
//     try {
//         const {
//             cart,
//             payment_method,
//             currency
//         } = req.body;

//         // Validate cart
//         if (!Array.isArray(cart) || cart.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Cart is empty"
//             });
//         }

//         // Validate payment method
//         if (!payment_method) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment method is required"
//             });
//         }

//         // Validate currency
//         if (!currency) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Currency is required"
//             });
//         }

//         // Get Flutterwave access token
//         const accessToken = await getAccessToken();
//         console.log(accessToken)

//         // Calculate subtotal from database
//         const subtotal = await calculateAmount(cart);

//         console.log("Calculated subtotal:", subtotal);

//         if (!Number.isFinite(subtotal) || subtotal <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Unable to calculate total amount"
//             });
//         }

//         // Get Flutterwave fee
//         const paymentFee = await getFlutterwavePaymentFees(
//             subtotal,
//             currency,
//             payment_method,
//             accessToken
//         );

//         console.log("Payment fee:", paymentFee);

//         if (!Number.isFinite(paymentFee) || paymentFee < 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Unable to get payment fee"
//             });
//         }

//         // Calculate final amount
//         const totalAmount = Number(
//             (subtotal + paymentFee).toFixed(2)
//         );

//         console.log("Subtotal:", subtotal);
//         console.log("Payment fee:", paymentFee);
//         console.log("Total amount:", totalAmount);

//         return res.status(200).json({
//             success: true,
//             subtotal,
//             paymentFee,
//             totalAmount,
//             currency,
//             payment_method
//         });

//     } catch (error) {

//         console.error(
//             "Payment fee error:",
//             error.response?.data || error.message
//         );

//         return res.status(500).json({
//             success: false,
//             message:
//                 error.response?.data?.error?.message ||
//                 error.message ||
//                 "Unable to calculate payment fee"
//         });
//     }
// });
//   app.post("/payment-method", verifyToken, async (req, res) => {
//   const {paymentMethod, paymentDetails, customer,subtotal,amount, paymentFee, totalAmount, currency} = req.body
//   console.log({"request" : req.body})
//   if (!paymentMethod) {
//     return res.status(400).json({
//         success: false,
//         message: "payment method is required"
//       });
//   }
//   let paymentMethodId;
//   const nonce = generateNonce();
//   const accessToken = await getAccessToken();
//   if (paymentMethod === "card") {
//       const {cardNumber, expiryYear, expiryMonth,  cvv} = paymentDetails
//       if (!cardNumber || !expiryYear || !expiryMonth || !cvv) {
//         return res.status(400).json({
//           success: false,
//           message: "field is required"
//         });
//       }

//       if (!customer || !customer.id || !customer.name || !customer.address || !customer.phone) {
//         return res.status(400).json({
//           success: false,
//           message: "customer information is required"
//         });
//       }

//       if (!currency || !totalAmount ) {
//         return res.status(400).json({
//           success : false,
//           message: "currency and amount is required"
//         });
//       }

      
//       try {
//     const encryptedCard = {
//         nonce,
//         encrypted_card_number: await encryptAES(
//             cardNumber,
//             process.env.FLW_ENCRYPTION_KEY,
//             nonce
//         ),

//         encrypted_expiry_month: await encryptAES(
//             expiryMonth,
//             process.env.FLW_ENCRYPTION_KEY,
//             nonce
//         ),

//         encrypted_expiry_year: await encryptAES(
//             expiryYear,
//             process.env.FLW_ENCRYPTION_KEY,
//             nonce
//         ),

//         encrypted_cvv: await encryptAES(
//             cvv,
//             process.env.FLW_ENCRYPTION_KEY,
//             nonce
//         )
//     };
//     console.log("Encrypted card details:", encryptedCard);
//     const generatePaymentMethod = await axios({
//       url :  'https://developersandbox-api.flutterwave.com/payment-methods',
//       method: "POST",

//       headers : {
//         Authorization : `Bearer ${accessToken}`,
//         "X-Idempotency-Key": idempotencyKey,
//         "X-Scenario-Key": "scenario:auth_pin&issuer:approved",
//         "Content-Type": "application/json"
//       },
//       data : {
//         "type": "card",
//         "card": encryptedCard,
//       }
//     })
//     console.log(generatePaymentMethod)
//     let response = generatePaymentMethod.data;
//     paymentMethodId = response.data.id;
//     console.log("Payment method ID:", paymentMethodId);
//     console.log(response)
//      if (response.status !== "success") {
      
//       return res.status(400).json({
//         success: false,
//         message: "Payment failed"
//       });
//     }
//   }catch(error){
//     console.error("Create payment error:", error?.response?.data || error.message);
//     return res.status(500).json({ success: false, message: error?.response?.data?.message || error.message });
//   }
//   }

//   try {
//     const initateCustomerCharge = await axios ({
//       url : 'https://developersandbox-api.flutterwave.com/charges',
//       method : "POST",
//       headers : {
//         Authorization : `Bearer ${accessToken}`,
//         "X-Idempotency-Key": idempotencyKey,
//         "X-Scenario-Key": "scenario:auth_pin&issuer:approved",
//         "Content-Type": "application/json"
//       },
//       data : {
//         "reference" : `AMANI-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//         "currency" : currency,
//         customer_id : customer.id,
//         "payment_method_id" : paymentMethodId,
//         "amount" : Number(totalAmount),
//         "meta" : {
//           person_name : customer.name.first + " " + customer.name.last,
//         }
//       }
//     })

//     let customerCharge  = await initateCustomerCharge.data;

//     if (!customerCharge || customerCharge.status !== "success") {
//       return res.status(400).json({
//         success: false,
//         message: "Customer charge failed"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Customer charged successfully",
//       customerCharge
//     });
//   }catch(error){
//     console.error("Charge customer error:", error?.response?.data || error.message);
//     return res.status(500).json({ success: false, message: error?.response?.data?.message || error.message });
//   }
// })

// app.post("/verifyPin", verifyToken, async(req, res) => {
//   const { pin, chargeId } = req.body;
//   if (!pin || !chargeId) {
//     return ({success : false, message: "pin and transaction id required"})
//   }

//   const accessToken = await getAccessToken()
//   const nonce = generateNonce()
//   const encrypted_pin = await encryptAES(
//             pin,
//             process.env.FLW_ENCRYPTION_KEY,
//             nonce
//         )

//   try {
//     const verifyPin = await axios({
//       url : `https://developersandbox-api.flutterwave.com/charges/${chargeId}`,
//       method : "PUT",
//       headers : {
//         Authorization : `Bearer ${accessToken}`,
//         "X-Idempotency-Key": idempotencyKey,
//         "X-Scenario-Key": "scenario:auth_pin&issuer:approved",
//         "Content-Type": "application/json"
//       },
//       data : {
//         "authorization" : {
//           "type" : "pin",
//           pin : {
//             nonce,
//             encrypted_pin
//           }

//         }
//       }
//     })

//     const response = await verifyPin.data;
//     if (!response || response.status !== "success") {
//       return res.status(400).json({
//         success: false,
//         message: "pin verification failed"
//       });
//     }
//     return res.status(200).json({
//         success: true,
//         data: response
//     });
//   }catch(error) {
//      console.error(
//         JSON.stringify(error.response?.data, null, 2)
//     );

//     return res.status(error.response?.status || 500).json({
//         success: false,
//         message:
//             error.response?.data?.error?.message ||
//             error.message
//     });
//   }
// })

// app.post("/verifyOtp", verifyToken, async (req, res) => {
//   try {
//     const auth = req.user;

//     const {
//       otp,
//       chargeId,
//       customerDetails,
//       cart
//     } = req.body;

//     // --------------------------------------------------
//     // 1. Validate request
//     // --------------------------------------------------

//     if (!otp || !chargeId || !Array.isArray(cart) || cart.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP, charge ID, and cart are required"
//       });
//     }

//     console.log("Cart:", cart);
//     console.log("Customer details:", customerDetails);

//     // --------------------------------------------------
//     // 2. Get Flutterwave access token
//     // --------------------------------------------------

//     const accessToken = await getAccessToken();

//     // --------------------------------------------------
//     // 3. Verify OTP
//     // --------------------------------------------------

//     const verifyOtp = await axios({
//       url: `https://developersandbox-api.flutterwave.com/charges/${chargeId}`,
//       method: "PUT",

//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "X-Idempotency-Key": idempotencyKey,
//         "X-Scenario-Key": "scenario:auth_pin&issuer:approved",
//         "Content-Type": "application/json"
//       },

//       data: {
//         authorization: {
//           type: "otp",
//           otp: {
//             code: otp
//           }
//         }
//       }
//     });

//     const otpResponse = verifyOtp.data;

//     console.log("OTP response:", otpResponse);

//     if (!otpResponse || otpResponse.status !== "success") {
//       return res.status(400).json({
//         success: false,
//         message: "OTP verification failed",
//         data: otpResponse
//       });
//     }

//     return res.status(200).json({
//       success : true,
//       message : "OTP verified successfully",
//       data : otpResponse
//     })

    
//   }catch(error) {
//      console.error(
//         JSON.stringify(error.response?.data, null, 2)
//     );

//     return res.status(error.response?.status || 500).json({
//         success: false,
//         message:
//             error.response?.data?.error?.message ||
//             error.message
//     });
//   }
// });

app.get("/customerOrders", verifyToken, async(req, res) => {
  const auth = req.user;

  try {
    // Verify user exists in database
    const user = await User.findById(auth._id).select("_id");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const orders = await Order.find({ customerId: auth._id })
      .select("orderNumber transactionId currency amount items orderStatus deliverydate paymentStatus createdAt")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders
    });

  } catch(error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
app.get("/customerOrderDetails/:id", verifyToken, async(req, res) => {
  const auth = req.user
  const orderId = req.params.id
  try {
     // Verify user exists in database
    const user = await User.findById(auth._id).select("_id houseNumber streetName city state shippingAddress");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customerId: auth._id
    })
    .select("products paymentStatus currency amount items orderStatus customerOrderReceivedDetails")
    .populate('products.productId', 'productImages')
    .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.json({
      success: true,
      order,
      user
    });
    
  } catch(error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }

})

app.put("/confirmItemReceived", verifyToken, async (req, res) => {
  const auth = req.user;
  const { orderId, itemId, productId, orderedQuantity, receivedQuantity } = req.body;

  try {
    const order = await Order.findOne({ _id: orderId, customerId: auth._id });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const item = order.items.find((orderItem) => orderItem._id?.toString() === itemId?.toString());

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in this order" });
    }

    const expectedQuantity = Number(item.quantity);
    const requestedQuantity = Number(receivedQuantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 0 || requestedQuantity > expectedQuantity) {
      return res.status(400).json({
        success: false,
        message: `Received quantity must be between 0 and ${expectedQuantity}`
      });
    }

    const detail = {
      itemId: item._id,
      productId: productId || item.productId,
      orderedQuantity: expectedQuantity,
      receivedQuantity: requestedQuantity,
      itemStatus: requestedQuantity === expectedQuantity ? "received" : "partially_received",
      satisfaction: requestedQuantity === expectedQuantity,
      receivedAt: new Date()
    };
    const detailIndex = order.customerOrderReceivedDetails.findIndex((entry) => entry.itemId?.toString() === itemId?.toString());

    if (detailIndex === -1) {
      order.customerOrderReceivedDetails.push(detail);
    } else {
      order.customerOrderReceivedDetails[detailIndex] = detail;
    }

    if (requestedQuantity === expectedQuantity) {
      item.status = "delivered";
    }
    order.orderStatus = updateOrderStatusFromItems(order);
    await order.save();

    return res.json({ success: true, message: "Item receipt saved", order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/complaints", verifyToken, async (req, res) => {
  const auth = req.user;
  const { orderId, itemId, complaint } = req.body;

  if (!orderId || !itemId || !complaint?.trim()) {
    return res.status(400).json({
      success: false,
      message: "orderId, itemId, and complaint are required",
    });
  }

  try {
    const order = await Order.findOne({ _id: orderId, customerId: auth._id }).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const item = order.items.find((orderItem) => orderItem._id?.toString() === itemId.toString());

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in this order" });
    }

    const product = await Product.findById(item.productId).select("_id vendorId").lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const savedComplaint = await Complaint.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      itemId: item._id,
      productId: product._id,
      vendorId: product.vendorId,
      customerId: auth._id,
      complaint: complaint.trim(),
      itemName: item.name,
      itemQuantity: item.quantity,
      itemPrice: item.price,
      itemColor: item.color,
      itemSize: item.size,
    });

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint: savedComplaint,
    });
  } catch (error) {
    console.error("Complaint submission error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit complaint" });
  }
});

app.get("/vendorOrderDetails/:id", verifyToken, async (req, res) => {
  const auth = req.user;
  const orderId = req.params.id;

  try {
    const user = await User.findById(auth._id).select("_id role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "User not authorized"
      });
    }

    const products = await Product.find({
      vendorId: user._id
    }).select("_id");

    const productIds = products.map(item => item._id);

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const vendorItems = (order.items || []).filter(item => {
      const itemProductId = item?.productId?.toString?.();
      return productIds.some((id) => id.toString() === itemProductId);
    });

    if (vendorItems.length === 0) {
      return res.status(403).json({
        success: false,
        message: "This order does not contain your products"
      });
    }


    const vendorItemId = vendorItems.map(item => item.productId)
    const vendorItemImage = await Product.find(
      {_id : {$in : vendorItemId}}
    ).select("_id productImages")
    const amount = order.amount
    const customerDetails = await User.findById(order.customerId).select("fname lname phoneNumber shippingAddress city state")
    const customerName = [customerDetails?.fname, customerDetails?.lname].filter(Boolean).join(" ") || order.customerName || "N/A"

    const vendorOrder = {
      _id: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      currency: order.currency,
      amount,
      createdAt: order.createdAt,
      paymentStatus: order.paymentStatus,
      customerName,
      customerPhone: customerDetails?.phoneNumber || order.customerPhone || "N/A",
      shippingAddress: customerDetails?.shippingAddress || "No shipping address provided",
      item: vendorItems,
      image: vendorItemImage,
      customerDetails,
    }

    return res.json({
      success: true,
      vendorOrder,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.post("/confirmItemAvailability", verifyToken, async (req, res) => {
  const auth = req.user;
  const { orderId, items = [] } = req.body;

  try {
    const user = await User.findById(auth._id).select("_id role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "User not authorized"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    items.forEach((itemUpdate) => {
      const itemIndex = order.items.findIndex((item) => {
        const itemId = itemUpdate.itemId?.toString();
        return (
          item._id?.toString() === itemId ||
          item.id?.toString() === itemId ||
          item.productId?.toString() === itemUpdate.productId?.toString()
        );
      });

      if (itemIndex === -1) return;

      const hasProduct = itemUpdate.hasProduct === true;
      const fullQuantityAvailable = itemUpdate.fullQuantityAvailable === true;
      const availableQuantity = Number(itemUpdate.availableQuantity || 0);

      order.items[itemIndex].availabilityConfirmed = true;
      order.items[itemIndex].availability = {
        hasProduct,
        fullQuantityAvailable,
        availableQuantity,
        originalQuantity: itemUpdate.originalQuantity || order.items[itemIndex].quantity || 0,
      };

      const detailIndex = order.vendorOrderQuantityDetails.findIndex((detail) => {
        const detailItemId = detail.itemId?.toString();
        return detailItemId === itemUpdate.itemId?.toString() || detail.productId?.toString() === itemUpdate.productId?.toString();
      });

      const vendorDetail = {
        itemId: order.items[itemIndex]._id?.toString() || itemUpdate.itemId,
        productId: itemUpdate.productId,
        originalQuantity: itemUpdate.originalQuantity || order.items[itemIndex].quantity || 0,
        availableQuantity,
        hasProduct,
        fullQuantityAvailable,
        itemStatus: !hasProduct ? "unavailable" : "confirmed",
        confirmedAt: new Date(),
      };

      if (detailIndex === -1) {
        order.vendorOrderQuantityDetails.push(vendorDetail);
      } else {
        order.vendorOrderQuantityDetails[detailIndex] = vendorDetail;
      }

      if (!hasProduct) {
        order.items[itemIndex].status = "unavailable";
      } else {
        order.items[itemIndex].status = "confirmed";
      }
    });

    const allItemsReviewed = order.items.every((item) => item.availabilityConfirmed === true);
    order.orderStatus = allItemsReviewed ? "verified" : "partially_verified";

    await order.save();

    return res.json({
      success: true,
      message: "Item availability confirmations saved",
      order
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.put("/markItemAsSent", verifyToken, async (req, res) => {
    try {
        const auth = req.user;
        const { orderId, itemId } = req.body;

        const user = await User.findById(auth._id).select("_id role");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.role !== "vendor") {
            return res.status(403).json({ success: false, message: "User not authorized" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const itemIndex = order.items.findIndex((item) => {
            const candidateId = itemId?.toString();
            return item._id?.toString() === candidateId || item.id?.toString() === candidateId || item.productId?.toString() === candidateId;
        });

        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        if (order.items[itemIndex].status === "unavailable") {
            return res.status(400).json({ success: false, message: "This item is marked unavailable and cannot be sent" });
        }

        order.items[itemIndex].status = "in_transit";
        order.items[itemIndex].sentAt = new Date();
        order.orderStatus = updateOrderStatusFromItems(order);

        await order.save();

        return res.json({ success: true, message: "Item marked as sent", order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

server.listen(4000, () => console.log("Server running on port 4000"));

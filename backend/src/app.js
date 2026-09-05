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
import userRoute from "./modules/users/users.route.js"
import likesRoute from "./modules/likes/like.route.js"
import {parseBooleanFlag} from "./utils/booleanFlag.js"
import { allowedOrigins } from "./utils/allowedOrigin.js";
import { getCookieOptions } from "./utils/getCookieOptions.js";
import refreshToken from "./modules/refresh/refresh.route.js"
import searchRoute from "./modules/search/search.route.js"
import adminRoute from "./modules/admin/admin.route.js"
import vendorRoute from "./modules/vendors/vendors.route.js"
import customerRoute from "./modules/customer/customer.route.js"
import paymentRoute from "./modules/payments/payment.route.js"
import orderRoute from "./modules/orders/orders.route.js"


dotenv.config();
export const app = express();
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

// Request logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    console.log(`[RESPONSE] ${res.statusCode} ${req.method} ${req.originalUrl}`);
  });

  next();
});


app.use("/products", productRoute)
app.use("/categories", categoryRoute)
app.use("/users", userRoute)
app.use("/likes", likesRoute)
app.use("/refresh", refreshToken)
app.use("/search", searchRoute)
app.use("/admin", adminRoute)
app.use("/vendor", vendorRoute)
app.use("/customer", customerRoute)
app.use("/payment", paymentRoute)
app.use("/order", orderRoute)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});



app.use(errorMidlleware)





// app.get(
//   "/designer/vendorProductAnalytics",
//   verifyToken,
//   async (req, res) => {
//     const auth = req.user;

//     try {
//       // check user
//       const user = await User.findById(auth._id).select("_id role");

//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found",
//         });
//       }

//       // check role
//       if (user.role !== "vendor") {
//         return res.status(403).json({
//           success: false,
//           message: "Access denied",
//         });
//       }

//       // vendor products
//       const vendorProducts = await Product.find({
//         vendorId: auth._id,
//       }).sort({ createdAt: -1 });

//       const productIds = vendorProducts.map(
//         (item) => item._id
//       );

//       // no products
//       if (productIds.length === 0) {
//         return res.json({
//           success: true,
//           message: "No products found for this vendor",
//           data: [],
//         });
//       }

//       // analytics
//       const [
//         sales,
//         orders,
//         comments,
//         ratings,
//         likes,
//       ] = await Promise.all([
//         Sales.aggregate([
//           {
//             $match: {
//               productId: { $in: productIds },
//             },
//           },
//         ]),

//         Orders.aggregate([
//           {
//             $match: {
//               "products.productId": {
//                 $in: productIds,
//               },
//             },
//           },
//         ]),

//         Comments.aggregate([
//           {
//             $match: {
//               targetId: { $in: productIds },
//             },
//           },
//         ]),

//         Rating.aggregate([
//           {
//             $match: {
//               productId: { $in: productIds },
//             },
//           },
//         ]),

//         Likes.aggregate([
//           {
//             $match: {
//               productId: { $in: productIds },
//             },
//           },
//         ]),
//       ]);

//       return res.json({
//         success: true,
//         analytics: {
//           sales,
//           orders,
//           comments,
//           ratings,
//           likes,
//         },
//       });

//     } catch (error) {
//       console.log(error);

//       res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }
// );




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


server.listen(4000, () => console.log("Server running on port 4000"));

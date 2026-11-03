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
import reviewsRoute from "./modules/reviews/reviews.route.js"
import {paystackWebhook} from "./integrations/paystack/webhook.js"


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
// Register webhook BEFORE express.json()
app.post(
  "/webhook/paystack",
  express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}),
  paystackWebhook
);


app.use(express.json());
app.use(cookieParser());
connectDB();

// ---- Socket.IO Setup ----
const server = http.createServer(app);





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
app.use("/reviews", reviewsRoute)


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});



app.use(errorMidlleware)





server.listen(4000, () => console.log("Server running on port 4000"));

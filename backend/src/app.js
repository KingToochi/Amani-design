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
import { getAccessToken } from "./integration/flutterwave/flutterwave.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { encryptAES } from "./integration/flutterwave/encryption.js";
import calculateAmount from "./modules/payments/calculateAmount.js";
import getFlutterwavePaymentFees from "./integration/flutterwave/paymentFee.js";
import paystackInitialization from "./integration/paystack/initialization.js";
import verifyPaystackPayment from "./integration/paystack/verify.js"
import errorMidlleware from "./middleware/error.middleware.js"
import productRoutes from "./modules/products/product.route.js"








dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://amanisky-fashion.vercel.app",
  "https://fashion.amanisky.tech",
  "https://www.fashion.amanisky.tech",
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean) : []),
].filter(Boolean);

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


const idempotencyKey = uuidv4().replace(/-/g, "");
const parseBooleanFlag = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off', ''].includes(normalized)) return false;
  }
  return Boolean(value);
};

const getCookieOptions = (req, options = {}) => {
  const origin = (req.headers.origin || "").toLowerCase();
  const isLocalOrigin = origin.includes("localhost") || origin.includes("127.0.0.1") || req.hostname === "localhost" || req.hostname === "127.0.0.1";
  // Only set the Secure flag in production for non-local origins.
  // const secure = isProduction && !isLocalOrigin;
  // console.log("Cookie options - Secure:", secure, "Origin:", origin, "Hostname:", req.hostname);                  
  // const sameSite = secure ? "none" : "lax";
  const secure = true
  const sameSite = "none"


  return {
    httpOnly: true,
    secure,
    sameSite,
    ...options,
  };
};

const updateOrderStatusFromItems = (order) => {
  const statuses = (order.items || []).map((item) => item.status);

  if (statuses.every((status) => status === "pending")) {
    return "pending";
  }

  if (statuses.every((status) => status === "unavailable")) {
    return "cancelled";
  }

  if (statuses.every((status) => ["delivered", "completed", "unavailable"].includes(status))) {
    return statuses.every((status) => status === "unavailable") ? "cancelled" : "delivered";
  }

  if (statuses.some((status) => ["in_transit", "delivered", "completed"].includes(status))) {
    return "in_transit";
  }

  if (statuses.includes("pending")) {
    return "partially_verified";
  }

  return "verified";
};

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

function generateNonce() {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let nonce = "";

    const bytes = crypto.randomBytes(12);

    for (let i = 0; i < 12; i++) {
        nonce += chars[bytes[i] % chars.length];
    }

    return nonce;
}


// ---- Multer ----
const uploadProduct = multer({ dest: "./products" });
const uploadImage = multer({dest: "./images"})

// ---- Cloudinary ----
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---- PRODUCTS ROUTES ----

// GET all products
// app.get("/products", async (req, res) => {
//   const products = await Product.find();
//   res.json(products);
// });
app.use("/products", productRoutes)
app.get("/categories", async (req, res) => {
  try {
    const fetchMenProduct = await Product.findOne({
      productSubCategory: { $regex: "\\bmen\\b", $options: "i" },
    });

  const fetchWomenProduct = await Product.findOne({
    productSubCategory: { $regex: "\\bwomen\\b", $options: "i" },
  });

  const fetchAccessories = await Product.findOne({
    productSubCategory: { $regex: "\\baccessory\\b", $options: "i" },
  });
    return res.status(200).json({success:true, fetchAccessories, fetchMenProduct, fetchWomenProduct})
  }catch(error){
    res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
  }
})

// get products by designer id 

app.get("/products/designer",verifyToken, async (req, res) => {
  const auth = req.user
  try{
    const user = await User.findOne({_id: auth._id})
    if (!user) {
      return res.status(404).json({success: false, message: "User not found" });
    }
    if (user.role !== "vendor" && user.role !== "designer") {
      return res.status(403).json({success: false, message: "Access denied. Only vendors and designers can view their products." });
    }
    const products = await Product.find({vendorId: auth._id})
    return res.status(200).json({success: true, products: products});
  }catch(error){
     return res.status(401).json({ success: false, message: "error fetching products"});
  }
})

// GET single product
app.get("/products/:_id", async (req, res) => {
  const product = await Product.findOne({ _id: req.params._id });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST new product
app.post(
  "/products",
  verifyToken,
  uploadProduct.array("productImages"), // Match frontend field name
  async (req, res) => {
    const auth = req.user
    try {
      console.log("Form Data Received:");
      console.log(req.body);
      console.log("Files:", req.files);
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

      // Validate required base fields
      if (!productDescription || !productName || !productCategory || !productSubCategory) {
        return res.status(400).json({
          message: "productDescription, productName, productCategory, and productSubCategory are required",
        });
      }

      // 4️⃣ Upload multiple images
      let productImageUrls = [];
      
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
          const cloudRes = await cloudinary.uploader.upload(file.path, {
            folder: "my_website_products",
          });
          // Remove temp file
          fs.unlink(file.path, () => {});
          return cloudRes.secure_url;
        });
        
        productImageUrls = await Promise.all(uploadPromises);
      }

      // 5️⃣ Extract variants from form data
      const variants = [];
      const variantKeys = Object.keys(req.body).filter(key => 
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
          variantMap.get(index)[type] = req.body[key];
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

      res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
      });

    } catch (error) {
      console.error(error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT update product
app.put("/products/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE product
app.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id });
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- USERS ROUTES ----

// User registration
app.post("/users/registration", async (req, res) => {
   console.log("Registration request body:", req.body);
  try {
    const { fname, lname, username, email, password, termsAndCondition, termsAccepted } = req.body;
    const acceptedTerms = parseBooleanFlag(termsAndCondition ?? termsAccepted);

    if (!fname || !lname || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });                                                      
    }

    if (!acceptedTerms) {
      return res.status(400).json({ success: false, message: "You must accept the terms and conditions" });
    }

    const exists = await User.findOne({
  $or: [
    { email: new RegExp(`^${email}$`, "i") },
    { username: new RegExp(`^${username}$`, "i") },
  ],
});

    if (exists) return res.status(400).json({success: false, message: "Email or username already exists" });
    const mainUsername = username.toLowerCase()
    const mainEmail = email.toLowerCase()
    let hashedPassword = await bcrypt.hash(password, 10)
    // const recoveryToken = crypto.randomBytes(32).toString("hex");
    const newUser = new User({
      joinedAt: new Date().toISOString(),
      fname,
      lname,
      username : mainUsername.trim(),
      email : mainEmail.trim(),
      phoneNumber: "",
      dob: "",
      profilePicture: "",
      password: hashedPassword,
      termsAndCondition: acceptedTerms,
      status: "approved",
      role: "user",
    });

    await newUser.save();
    const accessToken = await generateToken(mainEmail, { expiresIn: "30m" })
    const refreshToken = await generateToken(mainEmail, { expiresIn: "7d" })
  //  const hashedRecoveryToken = crypto.createHash("sha256").update(recoveryToken).digest("hex");

    // Set access token in HTTP-only cookie
    res.cookie("accessToken", accessToken, getCookieOptions(req, {
      maxAge: 30 * 60 * 1000  // 30 minutes
    }));

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
      path: "/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    }));

    // await storeToken(newUser._id, accessToken, refreshToken, hashedRecoveryToken)

    res.status(201).json({ success: true, message: "User registered successfully"});
  } catch (err) {
    console.error("User registration error:", err); // <-- Add this if not alrea
    res.status(500).json({success:false, message: "Server error" });
  }
});

app.post("/users/registration/designers",uploadImage.fields([
  {name: "profilePicture", maxCount: 1},
  {name: "proofOfAddress", maxCount: 1}
]), async (req, res) => {
  console.log(req.body)
  console.log("FILES:", req.files)

  try {
    const {fname, lname, email, phoneNumber, username, dob, password, houseNumber, streetName, meansOfIdentification, typeOfVendor, bankName, accountNumber, identificationNumber, city, state, termsAndCondition, termsAccepted} = req.body
    const acceptedTerms = parseBooleanFlag(termsAndCondition ?? termsAccepted);

  if (!fname || !lname || !email || !phoneNumber || !dob || !houseNumber || !streetName || !meansOfIdentification || !typeOfVendor || !bankName || !accountNumber || !identificationNumber || !city || !state ) {
  return res.json({message: "All fields required"})
}

if (!acceptedTerms) {
  return res.status(400).json({ success: false, message: "You must accept the terms and conditions" })
}

const exists = await User.findOne({
  $or: [
    { email: new RegExp(`^${email}$`, "i") },
    { username: new RegExp(`^${username}$`, "i") },
  ],
});

if (exists) {
  return res.json({success: false, message: "Email or username already exists"})
}
const mainUsername = username.toLowerCase()
const mainEmail = email.toLowerCase()

let profilePictureUrl = ""
let proofOfAddressUrl = ""
let hashedPassword = await bcrypt.hash(password, 10)

if (req.files.profilePicture) {
  const cloudRes = await cloudinary.uploader.upload(req.files.profilePicture[0].path, {
    folder: "my_website_users"
  })
  profilePictureUrl = cloudRes.secure_url;
  fs.unlink(req.files.profilePicture[0].path, () => {});
  console.log(profilePictureUrl)
}
if (req.files.proofOfAddress) {
        const cloudRes = await cloudinary.uploader.upload(req.files.proofOfAddress[0].path, {
          folder: "my_website_users",
        });
        proofOfAddressUrl = cloudRes.secure_url;
        fs.unlink(req.files.proofOfAddress[0].path, () => {});
        console.log(proofOfAddressUrl)
      }
        const recoveryToken = crypto.randomBytes(32).toString("hex");
       const newUser = new User({
        fname,
        lname,
        email : mainEmail.trim(),
        username : mainUsername.trim(),
        phoneNumber,
        dob,
        password: hashedPassword,
        houseNumber,
        streetName,
        typeOfVendor,
        bankName,
        accountNumber,
        meansOfIdentification,
        identificationNumber,
        profilePicture: profilePictureUrl,
        proofOfAddress: proofOfAddressUrl,
        city,
        state,
        country: "Nigeria",
        shippingAddress: `${houseNumber} ${streetName}, ${city}, ${state}`,
        termsAndCondition: acceptedTerms,
        role: "vendor",
      });
      await newUser.save();
      const accessToken = await generateToken(mainEmail, { expiresIn: "30m" })
      const refreshToken = await generateToken(mainEmail, { expiresIn: "7d" })



      // Set access token in HTTP-only cookie
      res.cookie("accessToken", accessToken, getCookieOptions(req, {
        maxAge: 30 * 60 * 1000  // 30 minutes
      }));

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
        path: "/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
      }));

      res.status(201).json({ success: true,  message: "User registered successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message : "sever error", error: error.message });
    }
      
})

// User login
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request body:", req.body);
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const loginIdentifier = String(email).trim().toLowerCase();
    const user = await User.findOne({ $or: [{ email: loginIdentifier }, { username: loginIdentifier }] });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if(user.role !== "user" && user.role !== "vendor") return res.status(403).json({ success: false, message: "Access denied" });
    const hashedPassword = user.password
    const ismatch = await bcrypt.compare(password, hashedPassword)
    if (!ismatch) return res.status(401).json({ success: false, message: "Incorrect password" });

    const accessToken = await generateToken(loginIdentifier, { expiresIn: "30m" })
    const refreshToken = await generateToken(loginIdentifier, { expiresIn: "7d" })
    // const recoveryToken = crypto.randomBytes(32).toString("hex");
    // const hashedRecoveryToken = await bcrypt.hash(recoveryToken, 10);
    // const userId = user._id

    // await storeToken(userId, accessToken, refreshToken, hashedRecoveryToken)
    // await User.findByIdAndUpdate(
    //   userId,
    //   { recoveryToken: recoveryToken },
    //   { new: true }
    // );

    // Set access token in HTTP-only cookie
    res.cookie("accessToken", accessToken, getCookieOptions(req, {
      maxAge: 30 * 60 * 1000  // 30 minutes
    }));

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
      path: "/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    }));


    console.log("Setting access token cookie");
    console.log("Access token exists:", !!accessToken);
    res.json({ success: true, message: "User login successful"});
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout
app.post("/logout", (req, res) => {
  // Clear HTTP-only cookies
  res.clearCookie("accessToken", getCookieOptions(req));

  res.clearCookie("refreshToken", getCookieOptions(req, {
    path: "/refresh"
  }));

  res.json({ success: true, message: "Logged out successfully" });
});

app.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  console.log("REFRESH REQUEST");
  console.log("Cookies:", req.cookies);
  console.log("Refresh token exists:", !!req.cookies?.refreshToken);

  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const newAccessToken = await generateToken(decoded.email, { expiresIn: "30m" });

    // Set new access token in HTTP-only cookie
    res.cookie("accessToken", newAccessToken, getCookieOptions(req, {
      maxAge: 30 * 60 * 1000  // 30 minutes
    }));

    res.json({ success: true, message: "Token refreshed", accessToken: newAccessToken });

  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token", err});
  }
});

app.post("/users/login/admin", async (req, res) => {
  try{
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const loginIdentifier = String(email).trim().toLowerCase();
    const user = await User.findOne({ $or: [{ email: loginIdentifier }, { username: loginIdentifier }] });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const hashedPassword = user.password
    console.log(hashedPassword)
    console.log(password)
    console.log(user)
    const ismatch = await bcrypt.compare(password, hashedPassword)
    if (!ismatch) return res.status(401).json({ success: false, message: "Incorrect password" });
    if (user.role !== "admin") return res.status(403).json({ success: false, message: "Access denied" });

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

    res.json({ success: true, message: "Admin login successful" });
  }catch(error){
    res.status(500).json({ message: "Server error", error: error.message});
  }
});

// Verify username
app.post("/users/username", async (req, res) => {
  try {
    const { username } = req.body;
    console.log(req.body)
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.json({ status: "free", message: "Username available" });
    res.json({ status: "exists", message: "Username already taken" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
    console.log(err)
  }
});

// Verify email
app.post("/users/email", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ status: "free", message: "Email available" });
    res.json({ status: "exist", message: "This email has been used" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.post("/like", async(req, res) => {
  try {
  const authHeader = req.headers.authorization
  const productId = req.body.productId
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("not auth header")
      return res.status(401).json({ message: "Unauthorized" });
    }
  const token = authHeader.split(" ")[1]
  const auth = jwt.verify(token, process.env.JWT_SECRET)
  console.log(auth)
  const id = auth._id
  console.log(auth)
  console.log(id)
  const user = await User.findOne({_id: id}) 
  if (user) {
  const exist = await Likes.findOne({userId: id, productId: productId })
  if (exist) {
    await Likes.deleteOne({userId: id, productId: productId  }) 
    res.json({status: "success", message: "product deleted "})
    return
  } else {
    const newLike = new Likes ({
      userId : id,
      productId: productId
    })
     await newLike.save()
    return res.json({status: "success", message: "product Liked"})
  }
  }
}catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
})

app.get("/likes", verifyToken, async(req, res) => {
  const auth = req.user
  
  try {
    const user = await User.findOne({_id : auth._id})

  if (!user) {
    return res.json({success:false, message:"user do not exist"})
  }
    const likedProducts = await Likes.find({userId : auth._id})
    return res.json({success: true, likedProducts})
  } catch(error){
    console.log(error)
  }
})

app.put("/user/update", verifyToken, async(req, res) => {
  const auth = req.user
  const updates = req.body

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: "No data provided for update" })
  }

  if (Object.keys(updates).includes("role") || Object.keys(updates).includes("status") || Object.keys(updates).includes("password") || Object.keys(updates).includes("subscription") || Object.keys(updates).includes("subscriber") || Object.keys(updates).includes("subscriptionDetails")) {
    return res.status(403).json({ success: false, message: "Unauthorized to update certain fields" })
  }

  try {
    const user = await User.findOne({_id : auth._id})
    if (!user) {
      return res.status(404).json({success: false, message: "User not found" })
    }


    // Update user fields
    Object.keys(updates).forEach(key => {
      if (key !== "_id") {
        user[key] = updates[key]
      }
    })

    await user.save()
    return res.json({ success: true, message: "User information updated successfully", user})
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: "An error occurred while updating user information", error })
  }
})

app.get("/userInfo", verifyToken, async(req, res) => {
  try {
    // Check if user data exists from token
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid authentication" 
      })
    }

    const user = await User.findOne({_id: req.user._id})
    
    if (!user) {
      return res.status(404).json({
        success: false, 
        message: "User does not exist"
      })
    }

    // Explicitly define which fields to return
    const userInfo = {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      shippingAddress: user.shippingAddress,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      city: user.city,
      state: user.state,
      profilePicture: user.profilePicture,
      username: user.username,
      role: user.role,
      typeOfVendor: user.typeOfVendor,
      status: user.status,
      subscriber: user.subscriber,
      subscriptionPlan: user?.subscriptionDetails?.plan,
      subscriptionStatus: user?.subscriptionDetails?.status,
      subscriptionStartDate: user?.subscriptionDetails?.startDate,
      subscriptionExpiryDate: user?.subscriptionDetails?.expiryDate,
      // Add any other non-sensitive fields here
    }
    
    return res.json({success: true, user: userInfo})
    
  } catch(error) {
    console.error('Error in /userInfo:', error)
    return res.status(500).json({ 
      success: false, 
      message: "An error occurred while fetching user information" 
    })
  } 
})
const generateToken = async (userIdentifier,  options = { expiresIn: "1h" }) => {
  const normalizedIdentifier = String(userIdentifier).trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
  });
   if (!user) {
    throw new Error("User not found")
  }
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    JWT_SECRET ,
    options
  )

  return token
}

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

app.get("/users", verifyToken, async(req, res) => {
    const auth = req.user
    console.log(auth)

    try {
      const user = await User.findOne({_id : auth._id})
      if (user) {
       const userDetails = {
          lname: user.lname,  
          fname: user.fname,  
          profilePicture: user.profilePicture,
          username: user.username,
          role: user.role,
          email: user.email,
          phoneNumber: user.phoneNumber,
          typeOfVendor: user.typeOfVendor
        }
        return res.status(200).json({success:true, message: "user details found", userData: userDetails})
  } else {
    console.log("i didnt found the user")
    return res.status(404).json({success:false, message:"user details not found"})
  }
    } catch (error) {
      console.log(error)
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

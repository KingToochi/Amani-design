import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import connectDB from "./db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();


const SECRET_KEY = process.env.SECRET_KEY || "amaniskysecrecy19962025";

// ---- Socket.IO Setup ----
const server = http.createServer(app);
const io = new Server(server);

// ---- Multer ----
const uploadProduct = multer({ dest: "./products" });

// ---- Cloudinary ----
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---- PRODUCTS ROUTES ----

// GET all products
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// GET single product
app.get("/products/:id", async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST new product
app.post("/products", uploadProduct.single("productImage"), async (req, res) => {

const authHeader = req.headers.authorization
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({message: "unauthorized"})
}

const token = authHeader.split(" ")[1]
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" })
  } else {
    const DesignerId = decoded.id
    const {productDescription, productCategory, productPrice, color, size } = req.body
    let productImageUrl = ""

    if (req.file) {
      // send image to cloudinary 
      const cloudRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "my_website_products",
        });
        productImageUrl = cloudRes.secure_url;
        fs.unlinkSync(req.file.path);
    }
       const newProduct = new Product ({
        DesignerId,
        productDescription,
        productCategory,
        productPrice,
        color,
        size,
        productImage: productImageUrl,
       })

       await newProduct.save()
       res.status(201).json(newProduct);
  }
}catch (error){res.status(500).json({ error: error.message });}

});

// PUT update product
app.put("/products/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { id: req.params.id },
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
    const deleted = await Product.findOneAndDelete({ id: req.params.id });
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
    const { fname, lname, username, email, password, status } = req.body;
    if (!fname || !lname || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: "Email or username already exists" });

    const newUser = new User({
      id: uuidv4(),
      joinedAt: new Date().toISOString(),
      fname,
      lname,
      username,
      email,
      password,
      status,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, username: newUser.username, status: newUser.status },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({ success: true, message: "User registered successfully", user: newUser, token });
  } catch (err) {
    console.error("User registration error:", err); // <-- Add this if not alrea
    res.status(500).json({ message: "Server error" });
  }
});

// User login
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    if (user.password !== password) return res.status(401).json({ success: false, error: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, status: user.status },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    const reply = user.status === "designer"
      ? { success: true, redirect: "/designer/products", token }
      : { success: true, redirect: "/", token };

    res.json(reply);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Verify username
app.post("/users/username", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.json({ status: "free", message: "Username available" });
    res.json({ status: "exists", message: "Username already taken" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
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

// generate token 
const generateToken = (user) => {
  
}

// ---- Start Server ----
server.listen(4000, () => console.log("Server running on port 4000"));

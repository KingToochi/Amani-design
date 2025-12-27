import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Likes from "./models/Likes.js";
import { json } from "stream/consumers";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();


const SECRET_KEY = process.env.SECRET_KEY || "amaniskysecrecy19962025";

// ---- Socket.IO Setup ----
const server = http.createServer(app);

const verifyToken = async(req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

  req.user = decoded

  next()
  }  catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
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
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// get products by designer id 

app.get("/products/designer", async (req, res) => {
  try{
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decoded.id)
    const products = await Product.find({DesignerId: decoded.id})
    if(products) {
      console.log("products found")
    }
    return res.status(200).json(products);
  }catch(error){
     return res.status(401).json({ message: "Invalid or expired token" });
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
  uploadProduct.single("productImage"),
  async (req, res) => {
    try {
      console.log(req.body);

      // 1️⃣ Authorization check
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // 2️⃣ Verify token
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const DesignerId = decoded.id;

      // 3️⃣ Extract & validate fields
      const {
        productDescription,
        productCategory,
        productPrice,
        color,
        size,
      } = req.body;

      if (!productDescription || !productCategory || !productPrice) {
        return res.status(400).json({
          message: "productDescription, productCategory and productPrice are required",
        });
      }

      // 4️⃣ Upload image (if exists)
      let productImageUrl = "";

      if (req.file) {
        const cloudRes = await cloudinary.uploader.upload(req.file.path, {
          folder: "my_website_products",
        });

        productImageUrl = cloudRes.secure_url;

        // remove temp file
        fs.unlink(req.file.path, () => {});
      }

      // 5️⃣ Save product
      const newProduct = new Product({
        DesignerId,
        productDescription,
        productCategory,
        productPrice: Number(productPrice),
        color,
        size,
        productImage: productImageUrl,
      });

      await newProduct.save();

      res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);


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

    const exists = await User.findOne({
  $or: [
    { email: new RegExp(`^${email}$`, "i") },
    { username: new RegExp(`^${username}$`, "i") },
  ],
});

    if (exists) return res.status(400).json({ message: "Email or username already exists" });

    const newUser = new User({
      joinedAt: new Date().toISOString(),
      fname,
      lname,
      username,
      email,
      phoneNumber: "",
      dob: "",
      profilePicture: "",
      address: "",
      city: "",
      state: "",
      shippingAddress: "",
      proofOfAddress: "",
      MeansOfIdentification: "",
      identificationNumber: "",
      password,
      status,
    });

    await newUser.save();

    const token = await generateToken(email)

    res.status(201).json({ success: true, message: "User registered successfully",  token });
  } catch (err) {
    console.error("User registration error:", err); // <-- Add this if not alrea
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/users/registration/designers",uploadImage.fields([
  {name: "profilePicture", maxCount: 1},
  {name: "proofOfAddress", maxCount: 1}
]), async (req, res) => {
  console.log(req.body)
  try {
    const {fname, lname, email, phoneNumber, dob, address, meansOfIdentification, identificationNumber} = req.body
  if (!fname || !lname || !email || !phoneNumber || !dob || !address || !meansOfIdentification || !identificationNumber ) {
  return res.json({message: "All fields required"})
}

let profilePictureUrl = ""
let proofOfAddressUrl = ""

if (req.files.profilePicture) {
  const cloudRes = await cloudinary.uploader.upload(req.files.profilePicture[0].path, {
    folder: "my_website_users"
  })
  profilePictureUrl = cloudRes.secure_url;
  fs.unlink(req.files.profilePicture[0].path, () => {});
}
if (req.files.proofOfAddress) {
        const cloudRes = await cloudinary.uploader.upload(req.files.proofOfAddress[0].path, {
          folder: "my_website_users",
        });
        proofOfAddressUrl = cloudRes.secure_url;
        fs.unlink(req.files.proofOfAddress[0].path, () => {});
      }
       const newUser = new User({
        fname,
        lname,
        email,
        phoneNumber,
        dob,
        address,
        meansOfIdentification,
        identificationNumber,
        profilePicture: profilePictureUrl,
        proofOfAddress: proofOfAddressUrl,
        city: "",
        state: "",
        shippingAddress: "";
        status: "designer"
      });

      await newUser.save();

      res.status(201).json({ success: true, user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
      
})




// User login
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    if (user.password !== password) return res.status(401).json({ success: false, error: "Incorrect password" });

    const token = await generateToken(email)

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

const generateToken = async (email) => {
  const user = await User.findOne({email: email})
   if (!user) {
    throw new Error("User not found")
  }
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      username: user.username,
      status: user.status
    },
    SECRET_KEY,
    { expiresIn: "1h" }
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

app.get("/users", verifyToken, async(req, res) => {
    const auth = req.user
    console.log(auth)

    try {
      const user = await User.findOne({_id : auth._id})
      if (user) {
        console.log("i found the user")
        return res.status(200).json({success:true, message: "user details found", user})
  } else {
    console.log("i didnt found the user")
    return res.status(404).json({success:false, message:"user details not found"})
  }
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, message: "Server error" });
    }
})



// ---- Start Server ----
server.listen(4000, () => console.log("Server running on port 4000"));

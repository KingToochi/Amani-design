import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken"

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// temporary secret key
const SECRET_KEY = "amaniskysecrecy19962025"

// ---- Socket.IO Setup ----
const server = http.createServer(app);
const io = new Server(server);

// io.on("connection", (socket) => {
//   socket.on("Hello", (data) => {
//     io.emit("receiveNotification", "welcome to Amanusky fashion world");
//   });
// });

server.listen(4000, () => console.log("Server running on port 4000"));

// ---- Load DB ----
const DB_FILE = "./db.json";
let rawData = fs.readFileSync(DB_FILE);
let db = JSON.parse(rawData);

// ---- Multer ----
const uploadProduct = multer({ dest: "./products" });

// ---- Cloudinary ----
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---- Save DB ----
const saveDB = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

// ---- Routes ----

// GET all products
app.get("/products", (req, res) => {
  res.json(db.products);
});

// GET single product
app.get("/products/:id", (req, res) => {
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST new Eroduct
app.post(
  "/products",
  uploadProduct.single("productImage"),
  async (req, res) => {
    try {
      const {
        productDescription,
        productCategory,
        productPrice,
        color,
        size,
      } = req.body;

      let productImageUrl = "";

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "my_website_products",
        });
        productImageUrl = result.secure_url;
        fs.unlinkSync(req.file.path);
      }

      const newProduct = {
        id: `${Date.now()}`,
        productDescription,
        productCategory,
        productPrice,
        color,
        size,
        productImage: productImageUrl,
      };

      db.products.push(newProduct);
      saveDB();

      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT update product
app.put("/products/:id", (req, res) => {
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1)
    return res.status(404).json({ message: "Product not found" });

  db.products[index] = { ...db.products[index], ...req.body };
  saveDB();
  res.json(db.products[index]);
});

// DELETE product
app.delete("/products/:id", (req, res) => {
  db.products = db.products.filter((p) => p.id !== req.params.id);
  saveDB();
  res.json({ message: "Product deleted" });
});

// verify user login 
app.post("/users/login", (req, res) => {
  const data = req.body
  const user = db.users.find(user => user.email == data.email)
  if(!user) {
    return res.status(404).json({ success: false, error: "User not found" })
  }

  if (user.password !== data.password) {
    return res.status(401).json({ success: false, error: "incorrect password" })
  }

  const token = jwt.sign({ email: user.email, status: user.status }, SECRET_KEY, { expiresIn: "1h" });
  let reply;
  if (user.status === "designer") {
    reply  = { success: true, redirect: "/designer/products", token };
  } else {
    reply = { success: true, redirect: "/", token};
  }
  res.json(reply)
})

// register new designer

app.post("/users/registration", (req, res) => {
  const data = req.body
  if (!data.fname || !data.lname || !data.username || !data.email ) {
    return res.status(400).json({message: "All fields are required"})
  } else {
    db.users.push(data)
    const token = jwt.sign({ email: data.email, status: data.status }, SECRET_KEY, { expiresIn: "1h" });
    res.status(201).json({message: "user registered successfully" , user : data,  token})
  }
})
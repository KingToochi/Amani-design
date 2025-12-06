
// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import dotenv from "dotenv";
// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json()); // parse JSON bodies

// // Load DB
// const DB_FILE = "./db.json";
// let rawData = fs.readFileSync(DB_FILE);
// let db = JSON.parse(rawData);

// // Multer setup
// const uploadProduct = multer({ dest: "./products" });

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Helper to save DB
// const saveDB = () => {
//   fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
// };

// // GET all products
// app.get("/products", (req, res) => {
//   res.json(db.products);
// });

// // GET single product
// app.get("/products/:id", (req, res) => {
//   const product = db.products.find(p => p.id === req.params.id);
//   if (!product) return res.status(404).json({ message: "Product not found" });
//   res.json(product);
// });

// // POST new Eroduct
// app.post("/products", uploadProduct.single("productImage"), async (req, res) => {
//   try {
//     const { productDescription, productCategory, productPrice, color, size } = req.body;
//     let productImageUrl = "";

//     if (req.file) {
//       const result = await cloudinary.uploader.upload(req.file.path, {
//         folder: "my_website_products",
//       });
//       productImageUrl = result.secure_url;
//       fs.unlinkSync(req.file.path);
//     }

//     const newProduct = {
//       id: `${Date.now()}`, // simple unique id
//       productDescription,
//       productCategory,
//       productPrice,
//       color,
//       size,
//       productImage: productImageUrl,
//     };

//     db.products.push(newProduct);
//     saveDB();

//     res.status(201).json(newProduct);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // PUT (update) product
// app.put("/products/:id", (req, res) => {
//   const index = db.products.findIndex(p => p.id === req.params.id);
//   if (index === -1) return res.status(404).json({ message: "Product not found" });

//   db.products[index] = { ...db.products[index], ...req.body };
//   saveDB();
//   res.json(db.products[index]);
// });

// // DELETE product
// app.delete("/products/:id", (req, res) => {
//   db.products = db.products.filter(p => p.id !== req.params.id);
//   saveDB();
//   res.json({ message: "Product deleted" });
// });

// app.listen(4000, () => console.log("Server running on port 4000"));


import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import { error } from "console";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

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
app.post("/users", (req, res) => {
  const data = req.body
  const user = db.users.find(user => user.email == data.email)
  if(!user) {
    return res.status(404).json({ success: false, error: "User not found" })
  }

  if (user.password !== data.password) {
    return res.status(401).json({ success: false, error: "incorrect password" })
  }

  let reply;
  if (user.status === "designer") {
    reply  = { success: true, redirect: "/designer/products" };
  } else {
    reply = { success: true, redirect: "/" };
  }
  res.json(reply)
})

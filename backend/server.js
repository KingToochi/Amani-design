// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import dotenv from "dotenv";
// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";



// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json())


// // Load DB
// const DB_FILE = "./db.json";
// let rawData = fs.readFileSync(DB_FILE);
// let db = JSON.parse(rawData);


// // ensure the /pproduct folder exist
// const dir = "./products"
// if(!fs.existsSync(dir)) {
//   fs.mkdirSync(dir, {recursive:true})
// }

// const uploadProduct = multer({dest: dir})

// // Multer config (temporary folder)
// const upload = multer({ dest: "uploads/" });

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });


// // get all product 
// app.get("/products", (req, res) => {
//   res.json(products)
// })
// // Get single product
// app.get("/products/:id", (req, res) => {
//   const product = products.find(p => p.id === req.params.id);
//   if (!product) return res.status(404).json({ message: "Product not found" });
//   res.json(product);
// });
// // upload a single file to product endpüoint

// app.post("/products", uploadProduct.single("productImage"),
//   async(req, res) => {
//     try {
//       const productImage = req.file;
//       let productImageUrl = "";

//       // upload to cloudinary if exist 
//       if (productImage) {
//         const productImageResult = await cloudinary.uploader.upload(productImage.path, {
//           folder: "my_website_products"
//         });
//         productImageUrl = productImageResult.secure_url;
//         fs.unlinkSync(productImage.path);
//       }
//       res.json({productImageUrl})
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// )

// // Upload endpoint for multiple files
// app.post(
//   "/upload",
//   upload.fields([
//     { name: "profilePicture", maxCount: 1 },
//     { name: "proofOfAddress", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const dpFile = req.files["profilePicture"]?.[0];
//       const proofFile = req.files["proofOfAddress"]?.[0];

//       let profilePictureUrl = "";
//       let ProofOfAddressUrl = "";

//       // Upload to Cloudinary if files exist
//       if (dpFile) {
//         const dpResult = await cloudinary.uploader.upload(dpFile.path, {
//           folder: "my_website_uploads",
//         });
//         profilePictureUrl = dpResult.secure_url;
//         fs.unlinkSync(dpFile.path);
//       }

//       if (proofFile) {
//         const proofResult = await cloudinary.uploader.upload(proofFile.path, {
//           folder: "my_website_uploads",
//         });
//         ProofOfAddressUrl = proofResult.secure_url;
//         fs.unlinkSync(proofFile.path);
//       }

//       res.json({ profilePictureUrl, ProofOfAddressUrl });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// app.listen(4000, () => console.log("Upload server running on port 4000"));


import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); // parse JSON bodies

// Load DB
const DB_FILE = "./db.json";
let rawData = fs.readFileSync(DB_FILE);
let db = JSON.parse(rawData);

// Multer setup
const uploadProduct = multer({ dest: "./products" });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to save DB
const saveDB = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

// GET all products
app.get("/products", (req, res) => {
  res.json(db.products);
});

// GET single product
app.get("/products/:id", (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// POST new product
app.post("/products", uploadProduct.single("productImage"), async (req, res) => {
  try {
    const { productDescription, productCategory, productPrice, color, size } = req.body;
    let productImageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "my_website_products",
      });
      productImageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const newProduct = {
      id: `${Date.now()}`, // simple unique id
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
});

// PUT (update) product
app.put("/products/:id", (req, res) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Product not found" });

  db.products[index] = { ...db.products[index], ...req.body };
  saveDB();
  res.json(db.products[index]);
});

// DELETE product
app.delete("/products/:id", (req, res) => {
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveDB();
  res.json({ message: "Product deleted" });
});

app.listen(4000, () => console.log("Server running on port 4000"));

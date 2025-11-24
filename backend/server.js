import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

dotenv.config();
const app = express();
app.use(cors());

// ensure the /pproduct folder exist
const dir = "./products"
if(!fs.existsSync(dir)) {
  fs.mkdirSync(dir, {recursive:true})
}

const uploadProduct = multer({dest: dir})

// Multer config (temporary folder)
const upload = multer({ dest: "uploads/" });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload a single file to product endpüoint

app.post("/products", uploadProduct.single("productImage"),
  async(req, res) => {
    try {
      const productImage = req.file;
      let productImageUrl = "";

      // upload to cloudinary if exist 
      if (productImage) {
        const productImageResult = await cloudinary.uploader.upload(productImage.path, {
          folder: "my_website_products"
        });
        productImageUrl = productImageResult.secure_url;
        fs.unlinkSync(productImage.path);
      }
      res.json({productImageUrl})
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
)

// Upload endpoint for multiple files
app.post(
  "/upload",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "proofOfAddress", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const dpFile = req.files["profilePicture"]?.[0];
      const proofFile = req.files["proofOfAddress"]?.[0];

      let profilePictureUrl = "";
      let ProofOfAddressUrl = "";

      // Upload to Cloudinary if files exist
      if (dpFile) {
        const dpResult = await cloudinary.uploader.upload(dpFile.path, {
          folder: "my_website_uploads",
        });
        profilePictureUrl = dpResult.secure_url;
        fs.unlinkSync(dpFile.path);
      }

      if (proofFile) {
        const proofResult = await cloudinary.uploader.upload(proofFile.path, {
          folder: "my_website_uploads",
        });
        ProofOfAddressUrl = proofResult.secure_url;
        fs.unlinkSync(proofFile.path);
      }

      res.json({ profilePictureUrl, ProofOfAddressUrl });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.listen(4000, () => console.log("Upload server running on port 4000"));

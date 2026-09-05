import express from "express"
import getAllProducts, { postProduct } from "./product.controller.js"
import { getVendorProducts } from "./product.controller.js"
import verifyToken from "../../middleware/verifyToken.js"
import { getProductById } from "./product.controller.js"
import { editProduct } from "./product.controller.js"
import { deleteProduct } from "./product.controller.js"
import multer from "multer"

const router = express.Router()

const uploadProduct = multer({ dest: "./products" });

router.get("/", getAllProducts)
router.get("/designer", verifyToken, getVendorProducts)
router.get("/:_id", getProductById)

router.post("/",verifyToken, uploadProduct.array("productImages"), postProduct)

router.put("/:id", verifyToken, editProduct)


router.delete("/:id", verifyToken, deleteProduct)

export default router
import express from "express";
import verifyToken from "../../middleware/verifyToken.js";
import { getProductReviews, saveProductReview } from "./reviews.controller.js";

const router = express.Router();

router.get("/products/:productId", getProductReviews);
router.post("/products/:productId", verifyToken, saveProductReview);

export default router;

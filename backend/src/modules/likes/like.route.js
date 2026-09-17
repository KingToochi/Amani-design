import express from "express"
import verifyToken from "../../middleware/verifyToken.js"
import { getLikes, getProductLikes, postLike } from "./like.controller.js"

const route = express.Router()
route.post ("/", verifyToken, postLike)
route.get("/", verifyToken, getLikes)
route.get("/product", getProductLikes)

export default route
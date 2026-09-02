import express from "express"
import verifyToken from "../../middleware/verifyToken.js"
import { getLikes, postLike } from "./like.controller.js"

const route = express.Router()
route.post ("/", verifyToken, postLike)
router.get("/", verifyToken, getLikes)
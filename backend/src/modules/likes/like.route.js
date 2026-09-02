import express from "express"
import verifyToken from "../../middleware/verifyToken"
import { getLikes, postLike } from "./like.controller"

const route = express.Router()
route.post ("/", verifyToken, postLike)
router.get("/", verifyToken, getLikes)
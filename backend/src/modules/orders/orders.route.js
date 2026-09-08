import express from "express"
import verifyToken from "../../middleware/verifyToken.js"
import { confirmItemSent, postOrderComplaint } from "./orders.controller.js"

const route = express.Router()

route.post("/complaints", verifyToken, postOrderComplaint)
route.put("/markItemSent", verifyToken, confirmItemSent)

export default route
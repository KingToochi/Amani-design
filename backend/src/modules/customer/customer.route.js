import express from "express"
import { confirmItemRecieved, getCustomerOrderDetails } from "./customer.controller.js"
import verifyToken from "../../middleware/verifyToken.js"

const route = express.Router()

route.get("/orders", verifyToken, getCustomerOrderDetails)
route.post("/confirmItemReceived", verifyToken, confirmItemRecieved)

export default route
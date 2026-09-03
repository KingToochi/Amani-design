import express from "express"
import { getCustomerOrderDetails } from "./customer.controller"
import verifyToken from "../../middleware/verifyToken"

const route = express.Router()

route.get("/orders", verifyToken, getCustomerOrderDetails)

export default route
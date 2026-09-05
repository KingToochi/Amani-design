import express from "express"
import { confirmItemRecieved, getCustomerOrderDetails, getCustomerOrderDetailsById} from "./customer.controller.js"
import verifyToken from "../../middleware/verifyToken.js"

const route = express.Router()

route.get("/orders", verifyToken, getCustomerOrderDetails)
route.get("/orderDetails/:id", verifyToken, getCustomerOrderDetailsById)
route.put("/confirmItemReceived", verifyToken, confirmItemRecieved)

export default route
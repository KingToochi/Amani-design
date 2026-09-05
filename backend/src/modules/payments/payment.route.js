import express from "express"
import verifyToken from "../../middleware/verifyToken.js"
import { initiatePayment, verifyPayment } from "./payment.controller.js"

const route = express.Router()

route.post("/initiate", verifyToken, initiatePayment)
route.post("/verify",verifyToken, verifyPayment )



export default route
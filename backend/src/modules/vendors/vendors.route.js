import express from "express"
import verifyToken from "../../middleware/verifyToken.js"
import { getOrderDetailsById, getProductAnalytics, getVendorOrders, getVendorSales } from "./vendors.controller.js"

const route = express.Router()

route.get("/productAnalytics",verifyToken, getProductAnalytics )
route.get("/sales",verifyToken, getVendorSales )
route.get("/orders",verifyToken, getVendorOrders )
route.get("/orderDetails/:id", verifyToken, getOrderDetailsById)

export default route
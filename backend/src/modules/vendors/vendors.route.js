import express from "express"
import verifyToken from "../../middleware/verifyToken.js"
import { confirmItem, getOrderDetailsById, getProductAnalytics, getVendorOrders, getVendorSales, getVendorNotifications, markNotificationRead } from "./vendors.controller.js"

const route = express.Router()

route.get("/productAnalytics",verifyToken, getProductAnalytics )
route.get("/sales",verifyToken, getVendorSales )
route.get("/orders",verifyToken, getVendorOrders )
route.get("/notifications", verifyToken, getVendorNotifications)
route.put("/notifications/:id/read", verifyToken, markNotificationRead)
route.get("/orderDetails/:id", verifyToken, getOrderDetailsById)
route.post("/confirmItemAvailability", verifyToken, confirmItem)

export default route
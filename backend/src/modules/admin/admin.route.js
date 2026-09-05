import express from "express"
import verifyToken from "../../middleware/verifyToken.js"
import { adminDetails, getCustomers, getOrders, getProducts, getVendors, getProductById, getVendorById, getCustomerById,dataAnalytics, adminLogin } from "./admin.controller.js"
const route = express.Router()
route.post ("/login", adminLogin)
route.get("/details",verifyToken, adminDetails)
route.get("/vendors",verifyToken, getVendors)
route.get("/customers",verifyToken, getCustomers)
route.get("/products",verifyToken, getProducts)
route.get("/orders", verifyToken, getOrders)
route.get("/viewProduct/:id", verifyToken, getProductById)
route.get("/viewVendor/:id", verifyToken, getVendorById)
route.get("/viewCustomer/:id", verifyToken, getCustomerById)
route.get("/data-analytics", verifyToken, dataAnalytics)

export default route
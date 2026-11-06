import express from "express"
import verifyToken from "../../middleware/verifyToken.js"
import { adminDetails, getCustomers, getOrders, getProducts, getVendors, getProductById, getVendorById, getCustomerById, dataAnalytics, adminLogin, verifyVendorDocuments, getVendorsDueForPayout, payvendor, reviewVendorPayoutItem } from "./admin.controller.js"
const route = express.Router()
route.post ("/login", adminLogin)
route.get("/details",verifyToken, adminDetails)
route.get("/vendors",verifyToken, getVendors)
route.get("/customers",verifyToken, getCustomers)
route.get("/products",verifyToken, getProducts)
route.get("/orders", verifyToken, getOrders)
route.get("/viewProduct/:id", verifyToken, getProductById)
route.get("/viewVendor/:id", verifyToken, getVendorById)
route.put("/vendors/:id/verification", verifyToken, verifyVendorDocuments)
route.get("/viewCustomer/:id", verifyToken, getCustomerById)
route.get("/data-analytics", verifyToken, dataAnalytics)
route.get("/vendorPayout", verifyToken, getVendorsDueForPayout)
route.post("/vendorPayout", verifyToken, payvendor)
route.put("/vendorPayout/review/:orderId/:itemId", verifyToken, reviewVendorPayoutItem)

export default route
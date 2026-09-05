import { fetchAdmin,validateAdminLoginData,  loginAdmin, fetchVendorDetails, fetchCustomerDetails, fetchProducts, fetchOrders, fetchProductDetailsById, fetchVendorDetailsById, fetchCustomerDetailsById, fetchDataAnalytics} from "./admin.service.js"

export const adminDetails = async(req, res, next) => {
    try {
        const auth = req.user
        const adminDetails = await fetchAdmin(auth)
        return res.json({ success: true, admin: adminDetails })
    }catch(error) {
        next(error)
    }
}

export const getVendors = async(req, res, next) => {
    try {
        const auth = req.user
        const vendors = await fetchVendorDetails(auth)
         return res.json({ success: true, vendors });
    }catch(error){
        next(error)
    } 
}

export const adminLogin = async(req, res, next)=> {
    try {
          const { email, password } = req.body;
          const validate = validateAdminLoginData({email, password})
          const logAdminIn = await loginAdmin({email, password})
          res.json({ success: true, message: "Admin login successful" });

    }catch(error){
        next(error)
    }
}


export const getCustomers = async(req, res, next) => {
    try {
        const auth = req.user
        const customers = await fetchCustomerDetails(auth)
         return res.json({ success: true, customers });
    }catch(error){
        next(error)
    } 
}

export const getProducts = async(req, res, next) => {
    try {
        const auth = req.user
        const products = await fetchProducts(auth)
         return res.json({ success: true, products});
    }catch(error){
        next(error)
    } 
}

export const getOrders = async(req, res, next) => {
    try {
        const auth = req.user
        const totalOrders = await fetchOrders(auth)
         return res.json({ success: true, totalOrders});
    }catch(error){
        next(error)
    } 
}

export const getProductById = async(req, res, next) => {
    try {
        const auth = req.user
        const product = await fetchProductDetailsById(auth)
        return res.json({ success: true, product });
    }catch(error) {
        next(error)
    }
}

export const getVendorById = async(req, res, next) => {
    try {
        const auth = req.user
        const vendor = await fetchVendorDetailsById(auth)
        return res.json({ success: true, vendor });
    }catch(error) {
        next(error)
    }
}

export const getCustomerById = async(req, res, next) => {
    try {
        const auth = req.user
        const customer = await fetchCustomerDetailsById(auth)
        return res.json({ success: true, customer });
    }catch(error) {
        next(error)
    }
}
export const dataAnalytics = async(req, res, next) => {
    try {
        const auth = req.user
        const analytics = await fetchDataAnalytics(auth)
        const { totalUsers, totalSales, totalOrders, totalProducts, topSeller, topBuyer, pendingApprovals, pendingOrders, deliveredOrders } = analytics
        return res.json({success: true, totalUsers, totalSales, totalOrders, totalProducts, topSeller, topBuyer, pendingApprovals, pendingOrders, deliveredOrders})
    }catch(error) {
        next(error)
    }

}
    
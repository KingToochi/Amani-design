import { getAdmin, fetchVendorDetails, fetchCustomerDetails, fetchProducts, fetchOrders, fetchProductDetailsById, fetchVendorDetailsById, fetchCustomerDetailsById} from "./admin.service"

export const adminDetails = async(req, res, next) => {
    try {
        const auth = req.user
        const adminDetails = await getAdmin(auth)
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
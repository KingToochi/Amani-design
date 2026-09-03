import User from "../../models/User.js"
import { validateVendor } from "./vendors.validation.js"
import Product from "../../models/Product.js";

export const fetchProductAnalytics = async(auth) => {
    const auth = req.user;
    const user = await User.findById(auth._id).select("_id role");

    const validate = validateVendor(user)
     // get all vendor products
        const products = await Product.find(
          { vendorId: user._id },
          { _id: 1 }
        );

        return products

}

export const fetchVendorProduct = async(auth) => {
    const auth = req.user;
    const user = await User.findById(auth._id).select("_id role");

    const validate = validateVendor(user)
     // get all vendor products
        const products = await Product.find(
          { vendorId: user._id }
        );

        return products

}

export const fetchVendorProductById = async() => {
     const auth = req.user;
    const user = await User.findById(auth._id).select("_id role");

    const validate = validateVendor(user)
     // get all vendor products
        const products = await Product.find(
          { vendorId: user._id }
        ).select(_id)
        return products
}
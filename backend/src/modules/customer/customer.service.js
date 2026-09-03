import { validateCustomer } from "./customer.validation.js";
import User from "../../models/User.js";
import Order from "../../models/Order.js";

export const fetchCustomerOrder = async(auth) => {
    const user = await User.findById(auth._id).select("_id");
    const validate = validateCustomer(user)

    const orders = await Order.find({ customerId: auth._id })
          .select("orderNumber transactionId currency amount items orderStatus deliverydate paymentStatus createdAt")
          .sort({ createdAt: -1 });

    return orders

}
export const fetchCustomerOrderById = async(auth, orderId) => {
    const user = await User.findById(auth._id).select("_id houseNumber streetName city state shippingAddress");
    const validate = validateCustomer(user)

    const order = await Order.findOne({
          _id: orderId,
          customerId: auth._id
        })
        .select("products paymentStatus currency amount items orderStatus customerOrderReceivedDetails")
        .populate('products.productId', 'productImages')
        .lean();
    
        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found"
          });
        }
    return order

}
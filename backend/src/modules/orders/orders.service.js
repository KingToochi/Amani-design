import Order from "../../models/Order.js"
import Product from "../../models/Product.js"
import User from "../../models/User.js";
import { validateVendor } from "../vendors/vendors.validation.js";
import { validateOrder } from "./orders.validation.js";
import { updateOrderStatusFromItems } from "../../utils/updateOrderStatus.js";

export const postComplaint = async({auth, itemId, orderId, complaint}) => {      
    console.log("postComplaint called with:", { auth, itemId, orderId, complaint });
    const order = await Order.findOne({ _id: orderId, customerId: auth._id }).lean();
    console.log(order._id, order.customerId, auth._id);
    console.log("Order found:", order);


    
        if (!order) {
            const error = new Error("Order not found")
            error.statusCode = 404
            throw error
        }
    
        const item = order.items.find((orderItem) => orderItem._id?.toString() === itemId.toString());
    
        if (!item) {
            const error = new Error("Item not found in this order" )
            error.statusCode = 404
            throw error
        }
    
        const product = await Product.findById(item.productId).select("_id vendorId").lean();
    
        if (!product) {
            const error = new Error("Product not found")
            error.statusCode = 404
            throw error
        }
    
        const savedComplaint = await Complaint.create({
          orderId: order._id,
          orderNumber: order.orderNumber,
          itemId: item._id,
          productId: product._id,
          vendorId: product.vendorId,
          customerId: auth._id,
          complaint: complaint.trim(),
          itemName: item.name,
          itemQuantity: item.quantity,
          itemPrice: item.price,
          itemColor: item.color,
          itemSize: item.size,
        });

        return savedComplaint;
}

export const markItemSent = async({auth, orderId, itemId}) => {
    const user = await User.findById(auth._id).select("_id role");
    validateVendor(user)
    const order = await Order.findById(orderId);
    validateOrder(order)
    const itemIndex = order.items.findIndex((item) => {
        const candidateId = itemId?.toString();
        return item._id?.toString() === candidateId || item.id?.toString() === candidateId || item.productId?.toString() === candidateId;
    });

    if (itemIndex === -1) {
        const error = new Error("Item not found")
        error.statusCode = 404
        throw error
    }

    if (order.items[itemIndex].status === "unavailable") {
        const error = new Error("This item is marked unavailable and cannot be sent")
        error.statusCode = 404
        throw error
    }

    order.items[itemIndex].status = "in_transit";
    order.items[itemIndex].sentAt = new Date();
    order.orderStatus = updateOrderStatusFromItems(order);

    await order.save();
}
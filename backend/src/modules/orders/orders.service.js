import Order from "../../models/Order.js"
import Product from "../../models/Product.js"
import User from "../../models/User.js";
import { validateVendor } from "../vendors/vendors.validation.js";
import { validateOrder } from "./orders.validation.js";
import { updateOrderStatusFromItems } from "../../utils/updateOrderStatus.js";
import Complaint from "../../models/Complaint.js";

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
    const itemIndex = order.items.findIndex((item) => item._id?.toString() === itemId?.toString());

    if (itemIndex === -1) {
        const error = new Error("Item not found")
        error.statusCode = 404
        throw error
    }

    const item = order.items[itemIndex];
    if (item.status === "unavailable") {
        const error = new Error("This item is marked unavailable and cannot be sent")
        error.statusCode = 409
        throw error
    }

    if (
        item.status !== "confirmed" ||
        !item.availabilityConfirmed ||
        item.availability?.hasProduct !== true ||
        item.sentAt
    ) {
        const error = new Error("Confirm this item's availability before marking it as sent");
        error.statusCode = 409;
        throw error;
    }

    const product = await Product.findById(item.productId);
    if (!product || product.vendorId.toString() !== user._id.toString()) {
        const error = new Error("Order item does not belong to this vendor");
        error.statusCode = 403;
        throw error;
    }

    const sentQuantity = item.availability.fullQuantityAvailable
        ? Number(item.quantity)
        : Number(item.availability.availableQuantity);
    if (!Number.isInteger(sentQuantity) || sentQuantity < 1 || sentQuantity > Number(item.quantity)) {
        const error = new Error("The confirmed send quantity is invalid");
        error.statusCode = 400;
        throw error;
    }

    const claim = await Order.updateOne(
        {
            _id: order._id,
            items: {
                $elemMatch: {
                    _id: item._id,
                    status: "confirmed",
                    availabilityConfirmed: true,
                    "availability.hasProduct": true,
                    sentAt: null,
                },
            },
        },
        {
            $set: {
                "items.$.status": "sending",
                "items.$.sentQuantity": sentQuantity,
            },
        }
    );
    if (!claim.matchedCount) {
        const error = new Error("This order item has already been sent or is being processed");
        error.statusCode = 409;
        throw error;
    }

    try {
        const isBaseProduct = item.id?.toString() === product._id.toString();
        const itemVariant = product.variants.find(
            (variant) => variant._id.toString() === item.id?.toString()
        ) || (!isBaseProduct
            ? product.variants.find((variant) => variant.color === item.color && variant.size === item.size)
            : null);
        let stockUpdate;
        let restoreStock;
        if (itemVariant) {
            restoreStock = () => Product.updateOne(
                {
                    _id: product._id,
                    variants: { $elemMatch: { _id: itemVariant._id } },
                },
                { $inc: { "variants.$.stock": sentQuantity } }
            );
            stockUpdate = await Product.updateOne(
                {
                    _id: product._id,
                    variants: { $elemMatch: { _id: itemVariant._id, stock: { $gte: sentQuantity } } },
                },
                { $inc: { "variants.$.stock": -sentQuantity } }
            );
        } else if (
            isBaseProduct ||
            (item.color === product.baseColor && item.size === product.baseSize)
        ) {
            restoreStock = () => Product.updateOne(
                { _id: product._id },
                { $inc: { stock: sentQuantity } }
            );
            stockUpdate = await Product.updateOne(
                { _id: product._id, stock: { $gte: sentQuantity } },
                { $inc: { stock: -sentQuantity } }
            );
        } else {
            const error = new Error("Unable to match this order item to product stock");
            error.statusCode = 409;
            throw error;
        }

        if (!stockUpdate.matchedCount) {
            const error = new Error("Insufficient stock to send the confirmed quantity");
            error.statusCode = 409;
            throw error;
        }

        let updatedOrder;
        try {
            updatedOrder = await Order.findOneAndUpdate(
                { _id: order._id, "items._id": item._id, "items.status": "sending" },
                {
                    $set: {
                        "items.$.status": "in_transit",
                        "items.$.sentAt": new Date(),
                    },
                },
                { new: true }
            );
        } catch (error) {
            const currentOrder = await Order.findById(order._id);
            const currentItem = currentOrder?.items.id(item._id);
            if (currentItem?.status === "sending") {
                await restoreStock();
                await Order.updateOne(
                    { _id: order._id, "items._id": item._id, "items.status": "sending" },
                    { $set: { "items.$.status": "confirmed", "items.$.sentQuantity": 0 } }
                );
            }
            throw error;
        }
        if (!updatedOrder) {
            await restoreStock();
            await Order.updateOne(
                { _id: order._id, "items._id": item._id, "items.status": "sending" },
                { $set: { "items.$.status": "confirmed", "items.$.sentQuantity": 0 } }
            );
            const error = new Error("Stock was updated but the order status could not be finalized");
            error.statusCode = 500;
            throw error;
        }

        updatedOrder.orderStatus = updateOrderStatusFromItems(updatedOrder);
        await updatedOrder.save();
        return updatedOrder;
    } catch (error) {
        await Order.updateOne(
            { _id: order._id, "items._id": item._id, "items.status": "sending" },
            { $set: { "items.$.status": "confirmed", "items.$.sentQuantity": 0 } }
        );
        throw error;
    }
}
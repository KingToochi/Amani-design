import Product from "../../models/product.model.js";
import Notification from "../../models/Notification.js";

export const vendorOrderNotification = async (order) => {

    const productId = order.products.productId;

    const product = await Product
        .findById(productId)
        .select("_id vendorId productName")
        .lean();

    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    const notification = await Notification.create({
        recipient: product.vendorId,

        type: "NEW_ORDER",

        title: "New Order",

        date: new Date(),

        message: `You have a new order for your product ${product.productName}`,

        channels: {
            website: true,
            email: true,
            whatsapp: true
        },

        read: false
    });

    return notification;
};
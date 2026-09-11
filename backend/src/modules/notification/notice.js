import Product from "../../models/Product.js";
import Notification from "../../models/Notification.js";

const createVendorOrderNotifications = async (order) => {
    if (!order?.products?.length) {
        return [];
    }

    const productIds = [...new Set(
        order.products
            .map((item) => item?.productId)
            .filter(Boolean)
    )];

    if (!productIds.length) {
        return [];
    }

    const products = await Product.find({
        _id: { $in: productIds }
    })
        .select("_id vendorId productName")
        .lean();

    const productsById = new Map(
        products.map((product) => [String(product._id), product])
    );

    const vendorOrdersMap = new Map();

    for (const item of order.products) {
        const product = productsById.get(String(item.productId));

        if (!product || !product.vendorId) {
            continue;
        }

        const vendorKey = String(product.vendorId);

        if (!vendorOrdersMap.has(vendorKey)) {
            vendorOrdersMap.set(vendorKey, {
                recipient: product.vendorId,
                products: [],
            });
        }

        vendorOrdersMap.get(vendorKey).products.push({
            productId: product._id,
            productName: product.productName,
            quantity: item.quantity || 1,
        });
    }

    const notifications = Array.from(vendorOrdersMap.values()).map((vendorOrder) => ({
        recipient: vendorOrder.recipient,
        type: "NEW_ORDER",
        title: "New Order",
        message: `You have a new order for ${vendorOrder.products.map((product) => `${product.productName}${product.quantity > 1 ? ` (${product.quantity})` : ""}`).join(", ")}.`,
        data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            products: vendorOrder.products,
        },
        channels: {
            website: true,
            email: true,
            sms: true,
            whatsapp: true,
        },
        read: false,
        createdAt: new Date(),
    }));

    if (!notifications.length) {
        return [];
    }

    return Notification.insertMany(notifications);
};

export default createVendorOrderNotifications;

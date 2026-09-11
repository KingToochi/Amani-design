import Product from "../../models/Product.js";
import Notification from "../../models/Notification.js";

const createVendorOrderNotifications = async (order) => {
    const orderItems = Array.isArray(order?.items) && order.items.length
        ? order.items
        : Array.isArray(order?.products) && order.products.length
            ? order.products.map((product) => ({
                productId: product.productId,
                quantity: product.quantity || 1,
                itemId: product._id || product.itemId || product.productId,
              }))
            : [];

    if (!orderItems.length) {
        return [];
    }

    const productIds = [...new Set(
        orderItems
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

    for (const item of orderItems) {
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
            itemId: item._id?.toString?.() || item.id?.toString?.() || item.itemId?.toString?.() || item.productId?.toString?.(),
            productId: product._id,
            productName: product.productName,
            quantity: item.quantity || 1,
            color: item.color || null,
            size: item.size || null,
            selectedVariantId: item.id || null,
            name: item.name || product.productName,
        });
    }

    const notifications = Array.from(vendorOrdersMap.values()).map((vendorOrder) => ({
        recipient: vendorOrder.recipient,
        type: "NEW_ORDER",
        title: "New Order",
        message: `You have a new order for ${vendorOrder.products.map((product) => {
            const options = [product.color, product.size].filter(Boolean);
            const label = options.length ? `${product.productName} (${options.join(", ")})` : product.productName;
            return product.quantity > 1 ? `${label} x ${product.quantity}` : label;
        }).join(", ")}.`,
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
        sentAt: new Date(),
    }));

    if (!notifications.length) {
        return [];
    }

    return Notification.insertMany(notifications);
};

export default createVendorOrderNotifications;

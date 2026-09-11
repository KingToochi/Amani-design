import Product from "../../models/Product.js";
import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../integrations/email/email.service.js";

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

    const vendorIds = [...new Set(
        products
            .map((product) => product.vendorId)
            .filter(Boolean)
            .map((id) => String(id))
    )];

    const vendors = await User.find({
        _id: { $in: vendorIds }
    })
        .select("_id email fname lname")
        .lean();

    const vendorMap = new Map(
        vendors.map((vendor) => [String(vendor._id), vendor])
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
                vendor: vendorMap.get(vendorKey),
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

    const createdNotifications = await Notification.insertMany(notifications);

    const frontendBaseUrl = process.env.FRONTEND_URL || "https://fashion.amanisky.tech";

    await Promise.allSettled(
        createdNotifications.map(async (notification) => {
            const vendor = vendorMap.get(String(notification.recipient));

            if (!vendor?.email) {
                return null;
            }

            const vendorToken = jwt.sign(
                {
                    _id: vendor._id,
                    email: vendor.email,
                    orderId: notification.data.orderId,
                    role: "vendor",
                },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            const orderDetailsUrl = `${frontendBaseUrl}/vendor/orders/vendor_order/${notification.data.orderId}?token=${encodeURIComponent(vendorToken)}`;

            const productListHtml = (notification.data.products || [])
                .map((product) => {
                    const attributes = [product.color, product.size].filter(Boolean).join(" / ");
                    const label = attributes ? `${product.productName} (${attributes})` : product.productName;
                    return `<li style="margin-bottom: 6px;">${label}${product.quantity > 1 ? ` x ${product.quantity}` : ""}</li>`;
                })
                .join("");

            const logoHtml = `
                <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AmaniSky logo">
                    <defs>
                        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#8b5cf6"/>
                            <stop offset="100%" stop-color="#d946ef"/>
                        </linearGradient>
                    </defs>
                    <rect width="120" height="120" rx="28" fill="#f5f3ff"/>
                    <circle cx="60" cy="60" r="38" fill="url(#brandGradient)" opacity="0.12"/>
                    <path d="M25 72c10-15 19-23 35-27 17-5 29 2 35 16-9-1-16 2-21 7-7 6-10 13-10 21-11 2-23-2-39-17Zm55-39c-7 1-13 5-17 12-4 7-4 15 0 22 9-1 18-6 23-13 5-7 6-15 1-21Zm-42 22c5-10 16-17 28-19-1 9 1 17 6 24-7 5-16 8-27 8-5-4-8-8-7-13Z" fill="url(#brandGradient)"/>
                </svg>
            `;

            await sendEmail({
                to: vendor.email,
                subject: `New order received for ${notification.data.orderNumber}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f8fafc; padding: 24px;">
                        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 24px; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);">
                            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 18px;">
                                <div style="width: 72px; height: 72px; border-radius: 18px; display: flex; align-items: center; justify-content: center; background: #f5f3ff;">
                                    ${logoHtml}
                                </div>
                                <div>
                                    <div style="font-size: 24px; font-weight: 700; color: #111827; letter-spacing: 0.02em;">AmaniSky</div>
                                    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; color: #6b7280;">Fashion World</div>
                                </div>
                            </div>

                            <div style="background: linear-gradient(135deg, #f5f3ff, #fdf2f8); border-radius: 12px; padding: 18px; margin-bottom: 18px;">
                                <h2 style="margin: 0 0 8px; color: #1f2937; font-size: 24px;">New Order Received</h2>
                                <p style="margin: 0; color: #374151;">Hello ${vendor.fname || "Vendor"},</p>
                            </div>

                            <p style="margin: 0 0 12px; color: #374151;">An order has been placed on your product(s).</p>
                            <p style="margin: 0 0 18px; color: #374151;"><strong>Order Number:</strong> ${notification.data.orderNumber}</p>

                            <ul style="padding-left: 20px; margin: 0 0 18px; color: #374151;">
                                ${productListHtml}
                            </ul>

                            <p style="margin: 0 0 18px;">
                                <a href="${orderDetailsUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">
                                    View order details
                                </a>
                            </p>

                            <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                This secure link is authorized by the backend and will expire in 24 hours.
                            </p>
                        </div>
                    </div>
                `,
            });

            return notification;
        })
    );

    return createdNotifications;
};

export default createVendorOrderNotifications;

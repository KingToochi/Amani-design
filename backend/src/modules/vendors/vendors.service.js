import User from "../../models/User.js"
import { validateVendor } from "./vendors.validation.js"
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";

export const fetchProductAnalytics = async(auth) => {
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
    const user = await User.findById(auth._id).select("_id role");

    const validate = validateVendor(user)
     // get all vendor products
        const products = await Product.find(
          { vendorId: user._id }
        );

        return products

}

export const fetchVendorProductById = async(auth) => {
    const user = await User.findById(auth._id).select("_id role");

    const validate = validateVendor(user)
     // get all vendor products
        const products = await Product.find(
          { vendorId: user._id }
        ).select("_id")
        return products
}

export const confirmItemAvailability = async({auth, orderId, items}) => {
  const user = await User.findById(auth._id).select("_id role");
   validateVendor(user)
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found")
    error.statusCode = 404
    throw error
    }

    items.forEach((itemUpdate) => {
      const rawItemId = itemUpdate.itemId?.toString() || itemUpdate.id?.toString();

      const itemIndex = order.items.findIndex((item) => {
        const currentItemId = item._id?.toString() || item.id?.toString();

        if (rawItemId) {
          return currentItemId === rawItemId;
        }

        return item.productId?.toString() === itemUpdate.productId?.toString();
      });

      if (itemIndex === -1) return;

      const currentItem = order.items[itemIndex];
      const hasProduct = itemUpdate.hasProduct === true;
      const fullQuantityAvailable = itemUpdate.fullQuantityAvailable === true;
      const availableQuantity = Number(itemUpdate.availableQuantity || 0);

      currentItem.availabilityConfirmed = true;
      currentItem.availability = {
        hasProduct,
        fullQuantityAvailable,
        availableQuantity,
        originalQuantity: itemUpdate.originalQuantity || currentItem.quantity || 0,
      };

      const detailIndex = order.vendorOrderQuantityDetails.findIndex((detail) => {
        const detailItemId = detail.itemId?.toString();

        if (rawItemId) {
          return detailItemId === rawItemId;
        }

        return detail.productId?.toString() === itemUpdate.productId?.toString();
      });

      const vendorDetail = {
        itemId: currentItem._id?.toString() || rawItemId,
        productId: itemUpdate.productId,
        originalQuantity: itemUpdate.originalQuantity || currentItem.quantity || 0,
        availableQuantity,
        hasProduct,
        fullQuantityAvailable,
        itemStatus: !hasProduct ? "unavailable" : "confirmed",
        confirmedAt: new Date(),
      };

      if (detailIndex === -1) {
        order.vendorOrderQuantityDetails.push(vendorDetail);
      } else {
        order.vendorOrderQuantityDetails[detailIndex] = vendorDetail;
      }

      if (!hasProduct) {
        currentItem.status = "unavailable";
      } else {
        currentItem.status = "confirmed";
      }
    });

    const allItemsReviewed = order.items.every((item) => item.availabilityConfirmed === true);
    order.orderStatus = allItemsReviewed ? "verified" : "partially_verified";

    await order.save();

    return order
}
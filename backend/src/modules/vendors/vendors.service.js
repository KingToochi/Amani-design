import User from "../../models/User.js"
import { validateVendor } from "./vendors.validation.js"
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";

export const fetchProductAnalytics = async(auth) => {
    const user = await User.findById(auth._id).select("_id role");

    validateVendor(user)
     // get all vendor products
        const products = await Product.find(
          { vendorId: user._id },
          { _id: 1 }
        );

        return products

}

export const fetchVendorProduct = async(auth) => {
    const user = await User.findById(auth._id).select("_id role");

  validateVendor(user)
     // get all vendor products
        const products = await Product.find(
          { vendorId: user._id }
        );

        return products

}

export const fetchVendorProductById = async(auth) => {
    const user = await User.findById(auth._id).select("_id role");

     validateVendor(user)
     // get all vendor products
        const products = await Product.find(
          { vendorId: user._id }
        ).select("_id")
        return products
}

export const confirmItemAvailability = async({auth, orderId, items}) => {
  const user = await User.findById(auth._id).select("_id role");
   validateVendor(user)
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("At least one item availability confirmation is required");
    error.statusCode = 400;
    throw error;
  }
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found")
    error.statusCode = 404
    throw error
    }

    const confirmations = [];
    for (const itemUpdate of items) {
      const rawItemId = itemUpdate.itemId?.toString() || itemUpdate.id?.toString();
      const itemIndex = order.items.findIndex((item) => item._id?.toString() === rawItemId);
      if (itemIndex === -1) {
        const error = new Error("Order item not found");
        error.statusCode = 404;
        throw error;
      }
      const currentItem = order.items[itemIndex];
      const product = await Product.findById(currentItem.productId).select("vendorId");
      if (!product || product.vendorId.toString() !== user._id.toString()) {
        const error = new Error("Order item does not belong to this vendor");
        error.statusCode = 403;
        throw error;
      }
      if (["sending", "in_transit", "delivered", "completed", "returned"].includes(currentItem.status)) {
        const error = new Error("This order item can no longer be updated");
        error.statusCode = 409;
        throw error;
      }

      const hasProduct = itemUpdate.hasProduct === true;
      const fullQuantityAvailable = itemUpdate.fullQuantityAvailable === true;
      const orderedQuantity = Number(currentItem.quantity);
      const availableQuantity = fullQuantityAvailable
        ? orderedQuantity
        : Number(itemUpdate.availableQuantity ?? 0);
      if (
        !Number.isInteger(orderedQuantity) ||
        orderedQuantity < 1 ||
        (hasProduct && (!Number.isInteger(availableQuantity) || availableQuantity < 1 || availableQuantity > orderedQuantity))
      ) {
        const error = new Error("Available quantity must be a whole number between 1 and the ordered quantity");
        error.statusCode = 400;
        throw error;
      }
      if (!hasProduct && availableQuantity !== 0) {
        const error = new Error("Unavailable items must have an available quantity of zero");
        error.statusCode = 400;
        throw error;
      }

      confirmations.push({ itemUpdate, currentItem, hasProduct, fullQuantityAvailable, availableQuantity, orderedQuantity, rawItemId });
    }

    confirmations.forEach(({ currentItem, hasProduct, fullQuantityAvailable, availableQuantity, orderedQuantity, rawItemId }) => {
      currentItem.availabilityConfirmed = true;
      currentItem.availability = {
        hasProduct,
        fullQuantityAvailable,
        availableQuantity,
        originalQuantity: orderedQuantity,
      };

      const detailIndex = order.vendorOrderQuantityDetails.findIndex((detail) => {
        const detailItemId = detail.itemId?.toString();

        return detailItemId === rawItemId;
      });

      const vendorDetail = {
        itemId: currentItem._id?.toString() || rawItemId,
        productId: currentItem.productId,
        originalQuantity: orderedQuantity,
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
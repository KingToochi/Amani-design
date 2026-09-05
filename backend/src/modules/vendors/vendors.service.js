import User from "../../models/User.js"
import { validateVendor } from "./vendors.validation.js"
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";

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

export const fetchVendorProductById = async(auth) => {
    const user = await User.findById(auth._id).select("_id role");

    const validate = validateVendor(user)
     // get all vendor products
        const products = await Product.find(
          { vendorId: user._id }
        ).select(_id)
        return products
}

export const confirmItemAvailability = async({auth, orderId, items}) => {
  const user = await User.findById(auth._id).select("_id role");
  const validateVendor = validateVendor(user)
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found")
    error.statusCode = 404
    throw error
    }

    items.forEach((itemUpdate) => {
      const itemIndex = order.items.findIndex((item) => {
        const itemId = itemUpdate.itemId?.toString();
        return (
          item._id?.toString() === itemId ||
          item.id?.toString() === itemId ||
          item.productId?.toString() === itemUpdate.productId?.toString()
        );
      });

      if (itemIndex === -1) return;

      const hasProduct = itemUpdate.hasProduct === true;
      const fullQuantityAvailable = itemUpdate.fullQuantityAvailable === true;
      const availableQuantity = Number(itemUpdate.availableQuantity || 0);

      order.items[itemIndex].availabilityConfirmed = true;
      order.items[itemIndex].availability = {
        hasProduct,
        fullQuantityAvailable,
        availableQuantity,
        originalQuantity: itemUpdate.originalQuantity || order.items[itemIndex].quantity || 0,
      };

      const detailIndex = order.vendorOrderQuantityDetails.findIndex((detail) => {
        const detailItemId = detail.itemId?.toString();
        return detailItemId === itemUpdate.itemId?.toString() || detail.productId?.toString() === itemUpdate.productId?.toString();
      });

      const vendorDetail = {
        itemId: order.items[itemIndex]._id?.toString() || itemUpdate.itemId,
        productId: itemUpdate.productId,
        originalQuantity: itemUpdate.originalQuantity || order.items[itemIndex].quantity || 0,
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
        order.items[itemIndex].status = "unavailable";
      } else {
        order.items[itemIndex].status = "confirmed";
      }
    });

    const allItemsReviewed = order.items.every((item) => item.availabilityConfirmed === true);
    order.orderStatus = allItemsReviewed ? "verified" : "partially_verified";

    await order.save();

    return order
}
import { validateCustomer } from "./customer.validation.js";
import User from "../../models/User.js";
import Order from "../../models/Order.js";
import {updateOrderStatusFromItems} from "../../utils/updateOrderStatus.js";

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
          const error = new Error("Order not found")
          error.statusCode = 404
          throw error
        }
    return {order, user}

}

export const confirmRecievedItem = async({auth, orderId, itemId, productId, orderedQuantity, receivedQuantity}) => {
  const order = await Order.findOne({ _id: orderId, customerId: auth._id });
  if (!order) {
      const error = new Error("Order not found")
      error.statusCode = 404
      throw error
    }

    const item = order.items.find((orderItem) => orderItem._id?.toString() === itemId?.toString());

    if (!item) {
      const error = new Error("Item not found in this order")
      error.statusCode = 404
      throw error
    }

    const expectedQuantity = Number(item.quantity);
    const requestedQuantity = Number(receivedQuantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 0 || requestedQuantity > expectedQuantity) {
      const error = new Error(`Received quantity must be between 0 and ${expectedQuantity}`)
      error.statusCode = 400
      throw error
    }

    const detail = {
      itemId: item._id,
      productId: productId || item.productId,
      orderedQuantity: expectedQuantity,
      receivedQuantity: requestedQuantity,
      itemStatus: requestedQuantity === expectedQuantity ? "received" : "partially_received",
      satisfaction: requestedQuantity === expectedQuantity,
      receivedAt: new Date()
    };
    const detailIndex = order.customerOrderReceivedDetails.findIndex((entry) => entry.itemId?.toString() === itemId?.toString());

    if (detailIndex === -1) {
      order.customerOrderReceivedDetails.push(detail);
    } else {
      order.customerOrderReceivedDetails[detailIndex] = detail;
    }

    if (requestedQuantity === expectedQuantity) {
      item.status = "delivered";
    }
    order.orderStatus = updateOrderStatusFromItems(order);
    await order.save();

    return order;
}
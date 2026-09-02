export const updateOrderStatusFromItems = (order) => {
  const statuses = (order.items || []).map((item) => item.status);

  if (statuses.every((status) => status === "pending")) {
    return "pending";
  }

  if (statuses.every((status) => status === "unavailable")) {
    return "cancelled";
  }

  if (statuses.every((status) => ["delivered", "completed", "unavailable"].includes(status))) {
    return statuses.every((status) => status === "unavailable") ? "cancelled" : "delivered";
  }

  if (statuses.some((status) => ["in_transit", "delivered", "completed"].includes(status))) {
    return "in_transit";
  }

  if (statuses.includes("pending")) {
    return "partially_verified";
  }

  return "verified";
};
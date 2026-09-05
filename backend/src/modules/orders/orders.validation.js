
export const validateOrderComplaint = ({orderId, itemId, complaint}) => {
    if (!orderId || !itemId || !complaint?.trim()) {
        const error = new Error("orderId, itemId, and complaint are required")
        error.statusCode = 400
        throw error
    }
    return
}

export const validateOrder = (order) => {
    if (!order) {
        const error = new Error("Order not found")
        error.statusCode = 404
        throw error
        }
    return
}
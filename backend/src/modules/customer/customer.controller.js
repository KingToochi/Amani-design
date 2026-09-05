import { fetchCustomerOrder } from "./customer.service.js";


export const getCustomerOrderDetails = async(req, res, next) => {
    try {
        const auth = req.user;
        const orders = await fetchCustomerOrder(auth)
        return res.json({
            success: true,
            orders
        });
    }catch(error) {
        next(error)
    }
}

export const getCustomerOrderDetailsById = async(req, res, next) => {
    try {
        const auth = req.user;
        const orderId = req.params.id
        const order = await fetchCustomerOrder(auth)
        return res.json({
            success: true,
            order
        });
    }catch(error) {
        next(error)
    }
}

export const confirmItemRecieved = async(req, res, next) => {
    try {
        const auth = req.user;
        const { orderId, itemId, productId, orderedQuantity, receivedQuantity } = req.body;
        const order = await confirmItemRecieved({auth, orderId, itemId, productId, orderedQuantity, receivedQuantity})
        return res.json({ success: true, message: "Item receipt saved", order });
    }catch(error) {
        next(error)
    }
}
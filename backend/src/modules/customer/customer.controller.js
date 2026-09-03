import { fetchCustomerOrder } from "./customer.service";


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
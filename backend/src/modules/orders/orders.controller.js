import { markItemSent, postComplaint } from "./orders.service.js";
import { validateOrderComplaint } from "./orders.validation.js";


export const postOrderComplaint = async(req, res, next) => {
    try {
        const auth = req.user;
        const { orderId, itemId, complaint } = req.body;
        const validateComplaint = validateOrderComplaint({ orderId, itemId, complaint })
        const savedComplaint = await postComplaint({auth, itemId, orderId})
        return res.status(201).json({
            success: true,
            message: "Complaint submitted successfully",
            complaint: savedComplaint,
        });
    }catch(error) {
        next(error)
    }
}

export const confirmItemSent = async(req, res, next) => {
    try{
        const auth = req.user;
        const { orderId, itemId } = req.body;
        const order = await markItemSent({auth, orderId, itemId})
        return res.json({ success: true, message: "Item marked as sent", order });
    }catch(error) {
        next(error)
    }
}
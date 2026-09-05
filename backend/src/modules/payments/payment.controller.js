import paystackInitialization from "../../integrations/paystack/initialize.js";
import { validatePaymentInitiation } from "./payment.validation.js";
import { paymentVerification } from "./payment..service.js";

export const initiatePayment = async(req, res, next) => {
    try {
        const { email, cart } = req.body;
        const initPaystack = await paystackInitialization(
            email,
            cart
        );
        const validate = validatePaymentInitiation

        return res.status(200).json({
            success: true,
            message: "Payment initialized successfully",
            data: initPaystack
        });
    } catch(error){
        next(error)
    }
}

export const verifyPayment = async(req, res, next) => {
    try {
        const auth = req.user
        const { reference, cart } = req.body;

        const newOrder = await paymentVerification({auth, reference, cart})
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            newOrder
        });


    }catch(error) {
        next(error)
    }
}
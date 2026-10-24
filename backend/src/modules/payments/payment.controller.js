import paystackInitialization from "../../integrations/paystack/initialize.js";
import { validatePaymentInitiation } from "./payment.validation.js";
import { paymentVerification } from "./payment.service.js";
import Payment from "../../models/Payment.js";

export const initiatePayment = async(req, res, next) => {
    try {
        const { email, cart } = req.body;
        console.log("Received request body:", req.body);
        const initPaystack = await paystackInitialization(
            email,
            cart
        );
        validatePaymentInitiation(initPaystack)
        console.log("Paystack initialization:", initPaystack);

        const payment = new Payment({
            reference: initPaystack.data.reference,
            acessCode: initPaystack.data.access_code,
            purpose: initPaystack.data.metadata.purpose,
            amount: initPaystack.data.amount,
            status: "pending"
        })

        await payment.save()

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
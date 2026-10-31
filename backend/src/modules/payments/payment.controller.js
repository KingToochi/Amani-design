import paystackInitialization from "../../integrations/paystack/initialize.js";
import { validatePaymentInitiation } from "./payment.validation.js";
import { paymentVerification } from "./payment.service.js";
import Payment from "../../models/Payment.js";

export const initiatePayment = async(req, res, next) => {
    try {
        const { email, cart } = req.body;
        console.log("Received request body:", req.body);
        const inititate = await paystackInitialization(
            email,
            cart
        );
        const initPaystack = inititate.data;
        const amount = inititate.amount;
        validatePaymentInitiation(initPaystack)
        console.log("Paystack initialization:", initPaystack);

        const payment = new Payment({
            reference: initPaystack.data.reference,
            acessCode: initPaystack.data.access_code,
            purpose: inititate.purpose,
            amount: Math.round(Number(amount)/100) ,
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

export const intiateVendorPayment = async(req, res, next) => {
    try {
        const { email, amount } = req.body;
    }catch(error) {
        next(error)
    }
}
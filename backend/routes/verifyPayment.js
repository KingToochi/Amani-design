import axios from "axios";
import Order from "../models/Order.js";

const verifyPaystackPayment = async (reference) => {

    if (!reference) {
        throw new Error("Payment reference is required");
    }

    // Check if this Paystack reference has already been used
    const existingOrder = await Order.findOne({
        paymentReference: reference
    });

    if (existingOrder) {

        throw new Error(
            "This payment reference has already been used"
        );
    }

    try {

        const response = await axios({
            url: `https://api.paystack.co/transaction/verify/${reference}`,
            method: "GET",

            headers: {
                Authorization:
                    `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        const payment = response.data.data;

        console.log(
            "Paystack verification response:",
            JSON.stringify(response.data, null, 2)
        );

        // Check whether Paystack says payment succeeded
        if (payment.status !== "success") {
            throw new Error("Payment was not successful");
        }

        return payment;

    } catch (error) {

        console.error(
            "Paystack verification error:",
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Unable to verify Paystack payment"
        );
    }
};

export default verifyPaystackPayment;
import axios from "axios";
import Order from "../../models/Order.js";
import Payment from "../../models/Payment.js"

const verifyPaystackPayment = async (reference) => {
    try {
        if (!reference) {
            throw new Error("Payment reference is required");
        }

        


        const response = await axios({
            url: `https://api.paystack.co/transaction/verify/${reference}`,
            method: "GET",

            headers: {
                Authorization:
                    `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        const payment = response.data.data;
        const paymentModel = await Payment.findOne({reference})

        // Check whether Paystack says payment succeeded
        if (payment.status !== "success") {
            
            if (paymentModel && paymentModel.status === "pending") {
                paymentModel.status = "failed"
                await paymentModel.save()
        }
            throw new Error("Payment was not successful");
        }

        if (paymentModel) {
            if(paymentModel.purpose === "payment for products"){
                 // Check if this Paystack reference has already been used
                const existingOrder = await Order.findOne({
                    paymentReference: reference
                });

                if (existingOrder) {

                    throw new Error(
                        "This payment reference has already been used"
                    );
                }
            }

            if(paymentModel.purpose === "Subscription payment") {
                if (paymentModel.status === "successful") {
                    throw new Error(
                        "This subscription payment reference has already been used"
                    );
                }
            }
           
        }

        const data = {
            payment,
            paymentModel
        }

        return data;

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
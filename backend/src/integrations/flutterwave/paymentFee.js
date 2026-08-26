import axios from "axios";
import crypto from "crypto";


const getFlutterwavePaymentFees = async (
    subtotal,
    currency,
    payment_method,
    accessToken
) => {

    try {

        const amount = Number(Number(subtotal).toFixed(2));

        const response = await axios.get(
            "https://developersandbox-api.flutterwave.com/fees",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                },

                params: {
                    amount,
                    currency,
                    payment_method,
                }
            }
        );

        console.log(
            "Flutterwave fee response:",
            JSON.stringify(response.data, null, 2)
        );

        if (response.data?.status !== "success") {
            throw new Error(
                response.data?.message ||
                "Unable to generate payment fee"
            );
        }

        const fees = response.data?.data?.fee || [];

        const paymentFee = fees.reduce(
            (total, fee) => {
                return total + Number(fee.amount || 0);
            },
            0
        );

        return Number(paymentFee.toFixed(2));

    } catch (error) {

        console.error("STATUS:", error.response?.status);

        console.error(
            "FLUTTERWAVE RESPONSE:",
            JSON.stringify(error.response?.data, null, 2)
        );

        console.error(
            "REQUEST URL:",
            error.config?.url
        );

        console.error(
            "REQUEST PARAMS:",
            error.config?.params
        );

        throw error;
    }
};
export default getFlutterwavePaymentFees;
import axios from "axios";

const getFlutterwavePaymentFees = async (
    subtotal,
    currency,
    payment_method,
    accessToken
) => {
        console.log(accessToken)
        console.log(payment_method)
        console.log(currency)
        console.log(subtotal)
     
    try {
        const amount = Number(subtotal.toFixed(2));
        console.log(amount)

        const getPaymentFee = await axios({
            url: "https://developersandbox-api.flutterwave.com/fees",
            method: "GET",

            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },

            params: {
                amount,
                currency,
                payment_method,
            },
        });

        if (getPaymentFee.data.status !== "success") {
            throw new Error("Unable to generate payment fee");
        }

        const fees = getPaymentFee.data.data.fee || [];

        const paymentFee = fees.reduce((total, fee) => {
        return total + Number(fee.amount || 0);
        }, 0);

        return paymentFee

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
import axios from "axios";

const getFlutterwavePaymentFees = async (
    subtotal,
    currency,
    payment_method,
    accessToken
) => {
    try {
        const amount = Number(subtotal.toFixed(2));

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
        console.error(
            "Flutterwave fee error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

export default getFlutterwavePaymentFees;
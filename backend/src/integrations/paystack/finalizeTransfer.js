import axios from "axios";

export const finalizeTransfer = async ({ otp, transferCode }) => {
    if (!String(otp ?? "").trim() || !transferCode) {
        const error = new Error("Transfer code and OTP are required");
        error.statusCode = 400;
        throw error;
    }

    const response = await axios.post(
        "https://api.paystack.co/transfer/finalize_transfer",
        {
            transfer_code: transferCode,
            otp: String(otp).trim(),
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.data?.status || !response.data?.data) {
        const error = new Error(response.data?.message || "Unable to finalize vendor payout");
        error.statusCode = 502;
        throw error;
    }

    return {
        status: response.data.data.status,
        reference: response.data.data.reference,
        transferCode: response.data.data.transfer_code,
        transferDate: response.data.data.transferred_at,
    };
};

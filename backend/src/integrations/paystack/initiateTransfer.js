import axios from "axios";
import { createTransferRecipient } from "./transferRecipient.js";

export const initiateTransfer = async ({ vendor, paidAmount, reference }) => {
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
        const error = new Error("Payout amount must be greater than zero");
        error.statusCode = 400;
        throw error;
    }

    const recipientCode = await createTransferRecipient(vendor);
    const response = await axios.post(
        "https://api.paystack.co/transfer",
        {
            source: "balance",
            amount: Math.round(paidAmount * 100),
            reference,
            recipient: recipientCode,
            currency: "NGN",
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.data?.status || !response.data?.data) {
        const error = new Error(response.data?.message || "Unable to initiate vendor payout");
        error.statusCode = 502;
        throw error;
    }

    return {
        transferCode: response.data.data.transfer_code,
        amount: response.data.data.amount,
        currency: response.data.data.currency,
        status: response.data.data.status,
        reference: response.data.data.reference,
        recipientCode: response.data.data.recipient_code,
        transferDate: response.data.data.transfer_date,
    };
};

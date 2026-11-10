import axios from "axios";

export const createTransferRecipient = async (vendor) => {
    if (vendor.recipientCode) return vendor.recipientCode;
    if (!vendor.bankCode || !vendor.accountNumber) {
        const error = new Error("Vendor bank code and account number are required for payout");
        error.statusCode = 400;
        throw error;
    }

    const response = await axios.post(
        "https://api.paystack.co/transferrecipient",
        {
            type: "nuban",
            name: `${vendor.fname} ${vendor.lname}`.trim(),
            account_number: vendor.accountNumber,
            bank_code: vendor.bankCode,
            currency: "NGN",
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    const recipientCode = response.data?.data?.recipient_code;
    if (!response.data?.status || !recipientCode) {
        const error = new Error(response.data?.message || "Unable to create Paystack transfer recipient");
        error.statusCode = 502;
        throw error;
    }

    vendor.recipientCode = recipientCode;
    await vendor.save();
    return recipientCode;
};

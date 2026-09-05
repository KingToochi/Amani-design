

export const validatePaymentInitiation = (initPaystack) => {
       if (!initPaystack.status) {
        const error = new Error("payment Failed")
        error.statusCode = 400
        throw error
        }

        return
}

export const verifyPaymentStatus = (verifiedPayment) => {
    if (verifiedPayment.status !== "success") {
        const error = new Error("unable to verify payment")
        error.statusCode = 400
        throw error
    }
    return
}
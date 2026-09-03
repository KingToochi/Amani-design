

export const validateCustomer = (user) => {
     if (!user) {
        const error = new Error("User not found")
        error.statusCode = 404

        throw error
    }
}
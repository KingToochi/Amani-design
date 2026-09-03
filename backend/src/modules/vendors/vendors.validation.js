

export const validateVendor = (user) => {
   
        if (!user) {
            const error = new Error("User not found")
            error.statusCode = 404
            throw error
        }
    
        if (user.role !== "vendor") {
          const error = new Error("Access denied")
            error.statusCode = 403
            throw error
        }

        return user
}
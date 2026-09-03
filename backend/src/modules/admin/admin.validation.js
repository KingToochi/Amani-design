export const validateAdmin = (user) => {
    if (!user || user.role !== "admin") {
        const error = new Error("Access denied")
        error.statusCode = 403
      throw error;
    }

    return user
}
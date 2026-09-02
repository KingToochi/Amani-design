
export const validateRefreshToken = (token) => {
     if (!token) {
        const error = new Error("No refresh token")
        error.statusCode = 401
        throw error
     }

     return
    

}

export const errorMiddleware = (error, req, res) => {
    console.log(error)

    return res.status(error.statusCode || 500).jaon({
        success : false,
        message : error.message || "Internal server error"
    })
}
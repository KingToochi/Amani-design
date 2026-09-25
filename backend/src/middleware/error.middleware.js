
const errorMiddleware = (error, req, res, next) => {
    console.log(error)

    return res.status(error.statusCode || 500).json({
        success : false,
        message : error.message || "Internal server error"
    })
}

export default errorMiddleware
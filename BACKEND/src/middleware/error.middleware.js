const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle MongoDB duplicate key error (11000)
    if (err.code === 11000) {
        statusCode = 409;
        message = "Short URL already exists";
    }

    return res.status(statusCode).json({
        success: false,
        message: message
    });
};

export default errorMiddleware;
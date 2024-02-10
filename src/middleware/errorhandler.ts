const errorHandler = (err: any, req: any, res: any, next: any) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
    });
};

export default errorHandler;

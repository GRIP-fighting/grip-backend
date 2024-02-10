class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true; // 이 에러가 예상된 에러인지 표시
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;

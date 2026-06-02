import { Request, Response, NextFunction } from "express";

/**
 * Logging middleware - logs all incoming requests
 */
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

/**
 * Error handling middleware
 */
export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);

    const status = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        error: message,
        status,
    });
};

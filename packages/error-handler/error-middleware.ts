import { AppError } from "./index";
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (err:Error , req:Request,res:Response,next:NextFunction) => {
if(err instanceof AppError) {
    console.error(`Error: ${req.method} ${req.url} - ${err.message} `);

return res.status(err.statusCode).json({
    status: 'error',
    message: err.message,
    ...(err.details && { details: err.details }),
})}
console.log("Unhandled error:", err);
return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
})  };

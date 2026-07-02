import { NextFunction, Request, Response } from "express";
import { HttpError } from "../common/http-error";

export const errorHandler = (err: Error | HttpError | any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    error: err.message ?? "Internal server error",
    details: err.details ?? undefined
  });
};

import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError.ts";
import { env } from "@/config/env.ts";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message });
    }

    console.error("× Unhandled error:", err);

    return res.status(500).json({
        error: "Internal server error",
        ...(env.NODE_ENV !== "production" && err instanceof Error
            ? { detail: err.message }
            : {}),
    });
}

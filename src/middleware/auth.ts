import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt.ts";
import { UnauthorizedError, ForbiddenError } from "@/utils/AppError.ts";
import type { UserRole } from "@/types/jwt.ts";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith("Bearer ")) {
            throw new UnauthorizedError("Missing or malformed Authorization header");
        }
        req.user = verifyToken(header.slice(7));
        next();
    } catch {
        next(new UnauthorizedError("Invalid or expired token"));
    }
}

export function requireRole(...roles: UserRole[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) return next(new UnauthorizedError("Authentication required"));
        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError("Insufficient permissions"));
        }
        next();
    };
}

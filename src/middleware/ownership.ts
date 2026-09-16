import type { Request, Response, NextFunction } from "express";
import {
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "@/utils/AppError.ts";
import type { UserRole } from "@/types/jwt.ts";

const PRIVILEGED_ROLES: readonly UserRole[] = ["teacher", "admin"];

function isPrivileged(req: Request): boolean {
    return !!req.user && PRIVILEGED_ROLES.includes(req.user.role);
}

export function scopeToOwnStudent(req: Request, _res: Response, next: NextFunction) {
    if (!req.user) return next(new UnauthorizedError("Authentication required"));
    if (isPrivileged(req)) return next();

    if (req.user.studentId === undefined) {
        return next(new ForbiddenError("Account is not linked to a student record"));
    }
    req.query.studentId = String(req.user.studentId);
    next();
}

export function requireOwnStudentParam(param = "id") {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) return next(new UnauthorizedError("Authentication required"));
        if (isPrivileged(req)) return next();

        if (
            req.user.studentId !== undefined &&
            Number(req.params[param]) === req.user.studentId
        ) {
            return next();
        }
        next(new ForbiddenError("You may only access your own record"));
    };
}

type OwnerLoader = (id: number) => Promise<number | null>;

export function requireResourceOwnership(loadOwnerStudentId: OwnerLoader) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new UnauthorizedError("Authentication required");
            if (isPrivileged(req)) return next();

            const ownerStudentId = await loadOwnerStudentId(Number(req.params.id));
            if (ownerStudentId === null) throw new NotFoundError("Resource not found");

            if (
                req.user.studentId === undefined ||
                ownerStudentId !== req.user.studentId
            ) {
                throw new ForbiddenError("You may only access your own resources");
            }
            next();
        } catch (err) {
            next(err);
        }
    };
}

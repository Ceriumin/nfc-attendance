export class AppError extends Error {
    public readonly status: number;
    public readonly isOperational = true;

    constructor(status: number, message: string) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/** 400 — the request body/params failed validation. */
export class ValidationError extends AppError {
    constructor(message = "Invalid request") {
        super(400, message);
    }
}

/** 401 — the request is not authenticated (bad credentials or missing/invalid token). */
export class UnauthorizedError extends AppError {
    constructor(message = "Not authenticated") {
        super(401, message);
    }
}

/** 403 — the request is authenticated but lacks permission for this resource. */
export class ForbiddenError extends AppError {
    constructor(message = "Insufficient permissions") {
        super(403, message);
    }
}

/** 404 — the requested resource does not exist. */
export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(404, message);
    }
}

/** 409 — the request conflicts with existing state (e.g. duplicate email). */
export class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(409, message);
    }
}

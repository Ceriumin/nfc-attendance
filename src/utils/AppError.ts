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

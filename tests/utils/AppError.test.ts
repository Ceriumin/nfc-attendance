import { describe, test, expect } from 'vitest'
import {
    AppError,
    ValidationError,
    NotFoundError,
    ConflictError,
} from "../../src/utils/AppError";

describe("AppError", () => {
    test("stores the status and message it was given", () => {
        const err = new AppError(418, "I'm a teapot");
        expect(err.status).toBe(418);
        expect(err.message).toBe("I'm a teapot");
    });

    test("marks itself as operational (an expected, handled error)", () => {
        expect(new AppError(500, "boom").isOperational).toBe(true);
    });

    test("sets name to the class name", () => {
        expect(new AppError(500, "boom").name).toBe("AppError");
    });
});

describe("ValidationError", () => {
    test("defaults to status 400", () => {
        expect(new ValidationError().status).toBe(400);
    });

    test("uses a sensible default message", () => {
        expect(new ValidationError().message).toBe("Invalid request");
    });

    test("accepts a custom message", () => {
        expect(new ValidationError("studentId is required").message)
            .toBe("studentId is required");
    });

    test("reports its own class name", () => {
        expect(new ValidationError().name).toBe("ValidationError");
    });

    test("is an instance of both AppError and Error", () => {
        const err = new ValidationError();
        expect(err).toBeInstanceOf(AppError);
        expect(err).toBeInstanceOf(Error);
    });
});

describe("NotFoundError", () => {
    test("defaults to status 404", () => {
        expect(new NotFoundError().status).toBe(404);
    });

    test("uses a sensible default message", () => {
        expect(new NotFoundError().message).toBe("Resource not found");
    });

    test("accepts a custom message", () => {
        expect(new NotFoundError("Attendance not found").message)
            .toBe("Attendance not found");
    });

    test("is an instance of AppError", () => {
        expect(new NotFoundError()).toBeInstanceOf(AppError);
    });
});

describe("ConflictError", () => {
    test("defaults to status 409", () => {
        expect(new ConflictError().status).toBe(409);
    });

    test("uses a sensible default message", () => {
        expect(new ConflictError().message).toBe("Resource already exists");
    });

    test("accepts a custom message", () => {
        expect(new ConflictError("Email already exists").message)
            .toBe("Email already exists");
    });

    test("is an instance of AppError", () => {
        expect(new ConflictError()).toBeInstanceOf(AppError);
    });
});

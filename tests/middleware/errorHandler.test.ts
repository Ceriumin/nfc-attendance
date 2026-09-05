import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

import { errorHandler } from "../../src/middleware/errorHandler.ts";
import { ValidationError, NotFoundError } from "../../src/utils/AppError.ts";

function mockRes() {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

const req = {} as Request;
const next = vi.fn() as unknown as NextFunction;

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    consoleErrorSpy.mockRestore();
});

describe("errorHandler", () => {
    test("maps an AppError to its own status and message", () => {
        const res = mockRes();

        errorHandler(new ValidationError("bad input"), req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "bad input" });
    });

    test("maps a NotFoundError to a 404", () => {
        const res = mockRes();

        errorHandler(new NotFoundError("missing"), req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "missing" });
    });

    test("maps an unknown error to a 500 with a generic message", () => {
        const res = mockRes();

        errorHandler(new Error("kaboom"), req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        // NOTE: outside production the handler also attaches a `detail` field,
        // so this asserts on the generic error message only. Adjust if NODE_ENV
        // is forced to "production" during tests.
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "Internal server error" }),
        );
    });

    test("logs unhandled errors to the console", () => {
        const res = mockRes();
        const err = new Error("kaboom");

        errorHandler(err, req, res, next);

        expect(consoleErrorSpy).toHaveBeenCalledWith("× Unhandled error:", err);
    });
});

import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

import { notFound } from "../../src/middleware/notFound.ts";
import { NotFoundError } from "../../src/utils/AppError.ts";

const res = {} as Response;
const next = vi.fn() as unknown as NextFunction;

beforeEach(() => {
    vi.clearAllMocks();
});

describe("notFound", () => {
    test("passes a NotFoundError describing the method and url to next", () => {
        const req = { method: "GET", originalUrl: "/api/unknown" } as Request;

        notFound(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        const err = vi.mocked(next).mock.calls[0][0];
        expect(err).toBeInstanceOf(NotFoundError);
        expect((err as NotFoundError).message).toBe("Cannot GET /api/unknown");
        expect((err as NotFoundError).status).toBe(404);
    });
});

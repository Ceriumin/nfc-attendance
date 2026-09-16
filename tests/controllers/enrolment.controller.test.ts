import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/services/enrolment.service.ts");

import * as enrolmentController from "../../src/controllers/enrolment.controller.ts";
import * as enrolmentService from "../../src/services/enrolment.service.ts";
import type { Enrolment } from "../../src/types/enrolment.ts";

const fakeEnrolment: Enrolment = { id: 1, student_id: 1, class_id: 1 };

function mockRes() {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
}

const next = vi.fn() as unknown as NextFunction;

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getEnrolments", () => {
    test("responds 200 with the list, passing the query through", async () => {
        vi.mocked(enrolmentService.getEnrolments).mockResolvedValue([fakeEnrolment]);
        const res = mockRes();
        await enrolmentController.getEnrolments({ query: { studentId: "1" } } as unknown as Request, res, next);
        expect(enrolmentService.getEnrolments).toHaveBeenCalledWith({ studentId: "1" });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(enrolmentService.getEnrolments).mockRejectedValue(err);
        await enrolmentController.getEnrolments({ query: {} } as unknown as Request, mockRes(), next);
        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("getEnrolmentById", () => {
    test("responds 200 with the enrolment, coercing the id param", async () => {
        vi.mocked(enrolmentService.getEnrolmentById).mockResolvedValue(fakeEnrolment);
        const res = mockRes();
        await enrolmentController.getEnrolmentById({ params: { id: "1" } } as unknown as Request, res, next);
        expect(enrolmentService.getEnrolmentById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("createEnrolment", () => {
    test("responds 201 with the created enrolment", async () => {
        vi.mocked(enrolmentService.createEnrolment).mockResolvedValue(fakeEnrolment);
        const res = mockRes();
        const body = { studentId: 1, classId: 1 };
        await enrolmentController.createEnrolment({ body } as Request, res, next);
        expect(enrolmentService.createEnrolment).toHaveBeenCalledWith(body);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(enrolmentService.createEnrolment).mockRejectedValue(err);
        await enrolmentController.createEnrolment({ body: {} } as Request, mockRes(), next);
        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("deleteEnrolment", () => {
    test("responds 204 with an empty body", async () => {
        vi.mocked(enrolmentService.deleteEnrolment).mockResolvedValue(undefined);
        const res = mockRes();
        await enrolmentController.deleteEnrolment({ params: { id: "1" } } as unknown as Request, res, next);
        expect(enrolmentService.deleteEnrolment).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });
});

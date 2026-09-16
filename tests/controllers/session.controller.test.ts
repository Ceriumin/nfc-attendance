import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/services/session.service.ts");

import * as sessionController from "../../src/controllers/session.controller.ts";
import * as sessionService from "../../src/services/session.service.ts";
import type { Session } from "../../src/types/session.ts";

const fakeSession: Session = {
    id: 1,
    day: "monday",
    start_time: "09:00:00",
    end_time: "10:00:00",
    class_id: 1,
};

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

describe("getSessions", () => {
    test("responds 200 with the list, passing the query through", async () => {
        vi.mocked(sessionService.getSessions).mockResolvedValue([fakeSession]);
        const res = mockRes();
        await sessionController.getSessions({ query: { classId: "1" } } as unknown as Request, res, next);
        expect(sessionService.getSessions).toHaveBeenCalledWith({ classId: "1" });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(sessionService.getSessions).mockRejectedValue(err);
        await sessionController.getSessions({ query: {} } as unknown as Request, mockRes(), next);
        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("getSessionById", () => {
    test("responds 200 with the session, coercing the id param", async () => {
        vi.mocked(sessionService.getSessionById).mockResolvedValue(fakeSession);
        const res = mockRes();
        await sessionController.getSessionById({ params: { id: "1" } } as unknown as Request, res, next);
        expect(sessionService.getSessionById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("createSession", () => {
    test("responds 201 with the created session", async () => {
        vi.mocked(sessionService.createSession).mockResolvedValue(fakeSession);
        const res = mockRes();
        const body = { day: "monday", startTime: "09:00", endTime: "10:00", classId: 1 };
        await sessionController.createSession({ body } as Request, res, next);
        expect(sessionService.createSession).toHaveBeenCalledWith(body);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(sessionService.createSession).mockRejectedValue(err);
        await sessionController.createSession({ body: {} } as Request, mockRes(), next);
        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("updateSession", () => {
    test("responds 200 with the updated session", async () => {
        vi.mocked(sessionService.updateSession).mockResolvedValue(fakeSession);
        const res = mockRes();
        const body = { day: "tuesday", startTime: "11:00", endTime: "12:00", classId: 1 };
        await sessionController.updateSession({ params: { id: "1" }, body } as unknown as Request, res, next);
        expect(sessionService.updateSession).toHaveBeenCalledWith(1, body);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("deleteSession", () => {
    test("responds 204 with an empty body", async () => {
        vi.mocked(sessionService.deleteSession).mockResolvedValue(undefined);
        const res = mockRes();
        await sessionController.deleteSession({ params: { id: "1" } } as unknown as Request, res, next);
        expect(sessionService.deleteSession).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });
});

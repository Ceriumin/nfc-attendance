import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/services/attendance.service.ts");

import * as attendanceController from "../../src/controllers/attendance.controller.ts";
import * as attendanceService from "../../src/services/attendance.service.ts";
import type { Attendance } from "../../src/types/attendance.ts";

const fakeAttendance: Attendance = {
    id: 1,
    student_id: 10,
    session_id: 20,
    status: "present",
    timestamp: new Date("2026-01-05T09:00:00"),
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

describe("getAttendanceById", () => {
    test("responds 200 with the attendance record", async () => {
        vi.mocked(attendanceService.getAttendanceById).mockResolvedValue(fakeAttendance);
        const res = mockRes();

        await attendanceController.getAttendanceById({ params: { id: "1" } } as unknown as Request, res, next);

        expect(attendanceService.getAttendanceById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeAttendance);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(attendanceService.getAttendanceById).mockRejectedValue(err);
        const res = mockRes();

        await attendanceController.getAttendanceById({ params: { id: "1" } } as unknown as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("getAttendance", () => {
    test("responds 200 with the filtered list, passing the query through", async () => {
        vi.mocked(attendanceService.getAttendance).mockResolvedValue([fakeAttendance]);
        const res = mockRes();
        const query = { studentId: "10", limit: "50" };

        await attendanceController.getAttendance({ query } as unknown as Request, res, next);

        expect(attendanceService.getAttendance).toHaveBeenCalledWith(query);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([fakeAttendance]);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(attendanceService.getAttendance).mockRejectedValue(err);
        const res = mockRes();

        await attendanceController.getAttendance({ query: {} } as unknown as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("createAttendance", () => {
    test("responds 201 with the created record", async () => {
        vi.mocked(attendanceService.createAttendance).mockResolvedValue(fakeAttendance);
        const res = mockRes();
        const body = { studentId: 10, sessionId: 20, status: "present" };

        await attendanceController.createAttendance({ body } as Request, res, next);

        expect(attendanceService.createAttendance).toHaveBeenCalledWith(body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(fakeAttendance);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(attendanceService.createAttendance).mockRejectedValue(err);
        const res = mockRes();

        await attendanceController.createAttendance({ body: {} } as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("updateAttendance", () => {
    test("responds 200 with the updated record", async () => {
        vi.mocked(attendanceService.updateAttendance).mockResolvedValue(fakeAttendance);
        const res = mockRes();
        const body = { studentId: 10, sessionId: 20, status: "late" };

        await attendanceController.updateAttendance({ params: { id: "1" }, body } as unknown as Request, res, next);

        expect(attendanceService.updateAttendance).toHaveBeenCalledWith(1, body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeAttendance);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(attendanceService.updateAttendance).mockRejectedValue(err);
        const res = mockRes();

        await attendanceController.updateAttendance({ params: { id: "1" }, body: {} } as unknown as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("deleteAttendance", () => {
    test("responds 204 with an empty body", async () => {
        vi.mocked(attendanceService.deleteAttendance).mockResolvedValue(true);
        const res = mockRes();

        await attendanceController.deleteAttendance({ params: { id: "1" } } as unknown as Request, res, next);

        expect(attendanceService.deleteAttendance).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(attendanceService.deleteAttendance).mockRejectedValue(err);
        const res = mockRes();

        await attendanceController.deleteAttendance({ params: { id: "1" } } as unknown as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("createAttendanceByTap", () => {
    test("responds 201, pulling cardUid/classId from the body and coercing classId", async () => {
        vi.mocked(attendanceService.createAttendanceByTap).mockResolvedValue(fakeAttendance);
        const res = mockRes();
        const body = { cardUid: "CARD-123", classId: "20" };

        await attendanceController.createAttendanceByTap({ body } as Request, res, next);

        expect(attendanceService.createAttendanceByTap).toHaveBeenCalledWith("CARD-123", 20);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(fakeAttendance);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(attendanceService.createAttendanceByTap).mockRejectedValue(err);
        const res = mockRes();

        await attendanceController.createAttendanceByTap({ body: {} } as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

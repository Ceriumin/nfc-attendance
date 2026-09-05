// NOTE: These are HTTP-level integration tests. They require `supertest`:
//   npm i -D supertest @types/supertest
// Until it's installed the import below will fail — that's expected.
import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the service layer so routes/controllers are exercised without a database.
vi.mock("@/services/attendance.service.ts");

import app from "../../src/app.ts";
import * as attendanceService from "../../src/services/attendance.service.ts";
import { NotFoundError, ValidationError } from "../../src/utils/AppError.ts";
import type { Attendance } from "../../src/types/attendance.ts";

const fakeAttendance: Attendance = {
    id: 1,
    student_id: 10,
    session_id: 20,
    status: "present",
    timestamp: new Date("2026-01-05T09:00:00"),
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("GET /api/attendance", () => {
    test("returns 200 with the filtered list", async () => {
        vi.mocked(attendanceService.getAttendance).mockResolvedValue([fakeAttendance]);

        const res = await request(app).get("/api/attendance").query({ studentId: "10" });

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(attendanceService.getAttendance).toHaveBeenCalled();
    });

    test("returns 400 when the service throws ValidationError", async () => {
        vi.mocked(attendanceService.getAttendance).mockRejectedValue(new ValidationError("bad status"));

        const res = await request(app).get("/api/attendance").query({ status: "nope" });

        expect(res.status).toBe(400);
    });
});

describe("GET /api/attendance/:id", () => {
    test("returns 200 with the record", async () => {
        vi.mocked(attendanceService.getAttendanceById).mockResolvedValue(fakeAttendance);

        const res = await request(app).get("/api/attendance/1");

        expect(res.status).toBe(200);
        expect(attendanceService.getAttendanceById).toHaveBeenCalledWith(1);
    });

    test("returns 404 when the record is missing", async () => {
        vi.mocked(attendanceService.getAttendanceById).mockRejectedValue(new NotFoundError("Attendance not found"));

        const res = await request(app).get("/api/attendance/999");

        expect(res.status).toBe(404);
    });
});

describe("POST /api/attendance", () => {
    test("returns 201 with the created record", async () => {
        vi.mocked(attendanceService.createAttendance).mockResolvedValue(fakeAttendance);
        const body = { studentId: 10, sessionId: 20, status: "present" };

        const res = await request(app).post("/api/attendance").send(body);

        expect(res.status).toBe(201);
        expect(attendanceService.createAttendance).toHaveBeenCalledWith(body);
    });
});

describe("PUT /api/attendance/:id", () => {
    test("returns 200 with the updated record", async () => {
        vi.mocked(attendanceService.updateAttendance).mockResolvedValue(fakeAttendance);
        const body = { studentId: 10, sessionId: 20, status: "late" };

        const res = await request(app).put("/api/attendance/1").send(body);

        expect(res.status).toBe(200);
        expect(attendanceService.updateAttendance).toHaveBeenCalledWith(1, body);
    });
});

describe("DELETE /api/attendance/:id", () => {
    test("returns 204 with no body", async () => {
        vi.mocked(attendanceService.deleteAttendance).mockResolvedValue(true);

        const res = await request(app).delete("/api/attendance/1");

        expect(res.status).toBe(204);
        expect(attendanceService.deleteAttendance).toHaveBeenCalledWith(1);
    });
});

describe("POST /api/attendance/tap", () => {
    test("returns 201 with the recorded attendance", async () => {
        vi.mocked(attendanceService.createAttendanceByTap).mockResolvedValue(fakeAttendance);

        const res = await request(app)
            .post("/api/attendance/tap")
            .send({ cardUid: "CARD-123", classId: "20" });

        expect(res.status).toBe(201);
        expect(attendanceService.createAttendanceByTap).toHaveBeenCalledWith("CARD-123", 20);
    });
});

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/repository/attendance.repository.ts");

import * as attendanceService from "../../src/services/attendance.service.ts";
import * as attendanceRepository from "../../src/repository/attendance.repository.ts";
import { ValidationError, NotFoundError, ConflictError } from "../../src/utils/AppError.ts";
import type { Attendance, SessionRow } from "../../src/types/attendance.ts";

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

describe("createAttendance", () => {
    test("rejects invalid input with a ValidationError", async () => {
        await expect(
            attendanceService.createAttendance({ studentId: 1, sessionId: 2 }),
        ).rejects.toThrow(ValidationError);

        expect(attendanceRepository.createAttendance).not.toHaveBeenCalled();
    });

    test("saves valid input and returns the created record", async () => {
        vi.mocked(attendanceRepository.createAttendance).mockResolvedValue(fakeAttendance);

        const input = { studentId: 10, sessionId: 20, status: "present" as const };
        const result = await attendanceService.createAttendance(input);

        expect(result).toEqual(fakeAttendance);
        expect(attendanceRepository.createAttendance).toHaveBeenCalledWith(input);
    });

    test("translates a duplicate-key DB error into a ConflictError", async () => {

        vi.mocked(attendanceRepository.createAttendance).mockRejectedValue({
            code: "ER_DUP_ENTRY",
        });

        await expect(
            attendanceService.createAttendance({ studentId: 10, sessionId: 20, status: "present" }),
        ).rejects.toThrow(ConflictError);
    });
});

describe("getAttendanceById", () => {
    test("rejects a non-positive id before hitting the database", async () => {
        await expect(attendanceService.getAttendanceById(0)).rejects.toThrow(ValidationError);
        expect(attendanceRepository.getAttendanceById).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when the repository returns null", async () => {
        vi.mocked(attendanceRepository.getAttendanceById).mockResolvedValue(null);

        await expect(attendanceService.getAttendanceById(999)).rejects.toThrow(NotFoundError);
    });

    test("returns the record when it exists", async () => {
        vi.mocked(attendanceRepository.getAttendanceById).mockResolvedValue(fakeAttendance);

        await expect(attendanceService.getAttendanceById(1)).resolves.toEqual(fakeAttendance);
    });
});

describe("createAttendanceByTap", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-05T09:00:00"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const sessionAt = (startTime: string): SessionRow =>
        ({ student_id: 10, session_id: 20, start_time: startTime } as SessionRow);

    test("throws NotFoundError when no session matches the tap", async () => {
        vi.mocked(attendanceRepository.getCurrentSession).mockResolvedValue([]);

        await expect(
            attendanceService.createAttendanceByTap("CARD-123", 1),
        ).rejects.toThrow(NotFoundError);
    });

    test("marks the student PRESENT when tapping within the grace period", async () => {
        vi.mocked(attendanceRepository.getCurrentSession).mockResolvedValue([sessionAt("09:00:00")]);
        vi.mocked(attendanceRepository.createAttendance).mockResolvedValue(fakeAttendance);

        await attendanceService.createAttendanceByTap("CARD-123", 1);

        expect(attendanceRepository.createAttendance).toHaveBeenCalledWith({
            studentId: 10,
            sessionId: 20,
            status: "present",
        });
    });

    test("marks the student LATE when tapping after the grace period", async () => {

        vi.mocked(attendanceRepository.getCurrentSession).mockResolvedValue([sessionAt("08:00:00")]);
        vi.mocked(attendanceRepository.createAttendance).mockResolvedValue(fakeAttendance);

        await attendanceService.createAttendanceByTap("CARD-123", 1);

        expect(attendanceRepository.createAttendance).toHaveBeenCalledWith({
            studentId: 10,
            sessionId: 20,
            status: "late",
        });
    });
});

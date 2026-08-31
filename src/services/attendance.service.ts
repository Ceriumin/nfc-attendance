import * as attendanceRepository from "@/repository/attendance.repository.ts";
import { checkWeekday } from "@/utils/checkWeekday.ts";
import isOnTime from "@/utils/checkAttendance.ts";
import { isDuplicateKeyError } from "@/utils/dbErrors.ts";
import { NotFoundError, ValidationError, ConflictError } from "@/utils/AppError.ts";
import type {
    Attendance, AttendanceFilters,
    AttendanceInput,
    AttendanceStatus,
} from "@/types/attendance.ts";

const STATUSES: readonly AttendanceStatus[] = ["present", "late", "absent"];

function assertValidInput(input: unknown): asserts input is AttendanceInput {
    const data = input as Partial<AttendanceInput> | null | undefined;
    if (
        !Number.isInteger(data?.studentId) ||
        !Number.isInteger(data?.sessionId) ||
        !data?.status ||
        !STATUSES.includes(data.status)
    ) {
        throw new ValidationError("studentId, sessionId and a valid status (present|late|absent) are all required");
    }
}


async function recordAttendance(input: AttendanceInput): Promise<Attendance> {
    try {
        return await attendanceRepository.createAttendance(input);
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            throw new ConflictError("Attendance for this student and session already exists");
        }
        throw err;
    }
}


export async function createAttendance(input: unknown): Promise<Attendance> {
    assertValidInput(input);

    return recordAttendance(input);
}

export async function createAttendanceByTap(cardUid: string, classId: number): Promise<Attendance> {
    const now = new Date();
    const day = checkWeekday(now.getDay()).toLowerCase();
    const time = now.toLocaleTimeString("en-US", { hour12: false });

    const rows = await attendanceRepository.getCurrentSession(cardUid, classId, day, time);

    const session = rows[0];

    if (!session) {
        throw new NotFoundError("No active session for this card right now");
    }

    const status: AttendanceStatus = isOnTime(session.start_time, time) ? "present" : "late";

    return recordAttendance({studentId: session.student_id, sessionId: session.session_id, status});
}

export async function getAttendanceById(id: number): Promise<Attendance> {
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError("Invalid attendance ID");
    }

    const attendance = await attendanceRepository.getAttendanceById(id);
    if (!attendance) throw new NotFoundError("Attendance not found");

    return attendance;
}

export async function getAttendance(query: Record<string, unknown>) {
    const filters: AttendanceFilters = {
        limit: clampInt(query.limit, 50, 1, 200),
        offset: clampInt(query.offset, 0, 0, Number.MAX_SAFE_INTEGER),
    }

    if(query.studentId !== undefined){
        const studentId = Number(query.studentId);
        if(!Number.isInteger(studentId) || studentId < 1){
            throw new ValidationError("Invalid student ID");
        }
        filters.studentId = studentId;
    }

    if(query.sessionId !== undefined){
        const sessionId = Number(query.sessionId);
        if(!Number.isInteger(sessionId) || sessionId < 1){
            throw new ValidationError("Invalid session ID");
        }
        filters.sessionId = sessionId;
    }

    if(query.status !== undefined){
        if (!STATUSES.includes(query.status as AttendanceStatus)) {
            throw new ValidationError("status must be present|late|absent");
        }
        filters.status = query.status as AttendanceStatus;
    }

    return await attendanceRepository.getAttendance(filters);
}

export async function updateAttendance(id: number, input: unknown) {
    assertValidInput(input);

    const attendance = await attendanceRepository.updateAttendance(id, input);
    if (!attendance) throw new NotFoundError("Attendance not found");

    return getAttendanceById(id);
}

export async function deleteAttendance(id: number) {
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError("Invalid attendance ID");
    }

    const deleted = await attendanceRepository.deleteAttendance(id);
    if (!deleted) throw new NotFoundError("Attendance not found");

    return deleted;
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
    const n = Number(value);
    if (!Number.isInteger(n)) return fallback;
    return Math.min(Math.max(n, min), max);
}

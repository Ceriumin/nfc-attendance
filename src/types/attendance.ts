import type { RowDataPacket } from "mysql2";

export type AttendanceStatus = "present" | "late" | "absent";

export interface Attendance {
    id: number;
    student_id: number;
    session_id: number;
    status: AttendanceStatus;
    timestamp: Date;
}

export interface AttendanceInput {
    studentId: number;
    sessionId: number;
    status: AttendanceStatus;
}

export interface AttendanceFilters {
    studentId?: number;
    sessionId?: number;
    status?: AttendanceStatus;
    limit: number;
    offset: number;
}

/* ————————— Database Row Types ————————— */

export type AttendanceRow = Attendance & RowDataPacket;

export interface SessionRow extends RowDataPacket {
    student_id: number;
    session_id: number;
    class_id: number;
    first_name: string;
    last_name: string;
    class_name: string;
    day: string;
    start_time: string;
    end_time: string;
}


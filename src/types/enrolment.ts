import type { RowDataPacket } from "mysql2";

export interface Enrolment {
    id: number;
    student_id: number;
    class_id: number;
}

export interface EnrolmentInput {
    studentId: number;
    classId: number;
}

/* ————————— Database Row Types ————————— */

export type EnrolmentRow = Enrolment & RowDataPacket;

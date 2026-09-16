import { db } from "@/database/connection.ts";
import type { ResultSetHeader } from "mysql2";
import type { Enrolment, EnrolmentInput, EnrolmentRow } from "@/types/enrolment.ts";

export async function getEnrolmentById(id: number): Promise<Enrolment | null> {
    const [rows] = await db.query<EnrolmentRow[]>(
        `SELECT * FROM enrolments WHERE id = ?`,
        [id],
    );
    return rows[0] ?? null;
}

export async function getAllEnrolments(): Promise<Enrolment[]> {
    const [rows] = await db.query<EnrolmentRow[]>(`SELECT * FROM enrolments`);
    return rows;
}

export async function getEnrolmentsByStudent(studentId: number): Promise<Enrolment[]> {
    const [rows] = await db.query<EnrolmentRow[]>(
        `SELECT * FROM enrolments WHERE student_id = ?`,
        [studentId],
    );
    return rows;
}

export async function getEnrolmentsByClass(classId: number): Promise<Enrolment[]> {
    const [rows] = await db.query<EnrolmentRow[]>(
        `SELECT * FROM enrolments WHERE class_id = ?`,
        [classId],
    );
    return rows;
}

export async function createEnrolment(data: EnrolmentInput): Promise<Enrolment> {
    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO enrolments (student_id, class_id) VALUES (?, ?)`,
        [data.studentId, data.classId],
    );

    // The row was just inserted, so it always exists.
    return (await getEnrolmentById(result.insertId))!;
}

export async function deleteEnrolment(id: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
        `DELETE FROM enrolments WHERE id = ?`,
        [id],
    );
    return result.affectedRows > 0;
}

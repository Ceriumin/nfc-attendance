import { db } from "@/database/connection.ts";
import type { ResultSetHeader } from "mysql2";
import type {
    Attendance,
    AttendanceInput,
    AttendanceRow,
    SessionRow,
    AttendanceFilters
} from "@/types/attendance.ts";

export async function getCurrentSession(
    cardUid: string,
    classId: number,
    day: string,
    time: string,
): Promise<SessionRow[]> {
    const [rows] = await db.query<SessionRow[]>(
        `
        SELECT DISTINCT
            students.id         AS student_id,
            sessions.id         AS session_id,
            classes.id          AS class_id,
            students.first_name,
            students.last_name,
            classes.name        AS class_name,
            sessions.day,
            sessions.start_time,
            sessions.end_time
        FROM cards
                 JOIN students   ON students.id           = cards.student_id
                 JOIN enrolments ON enrolments.student_id = students.id
                 JOIN classes    ON classes.id            = enrolments.class_id
                 JOIN sessions   ON sessions.class_id      = classes.id
        WHERE cards.card_uid = ?
          AND classes.id = ?
          AND sessions.day = ?
          AND sessions.start_time <= ?
          AND sessions.end_time   >= ?;`,
        [cardUid, classId, day, time, time],
    );
    return rows;
}

export async function getAttendanceById(id: number): Promise<Attendance | null> {
    const [rows] = await db.query<AttendanceRow[]>(
        `SELECT * FROM attendance WHERE id = ?`,
        [id],
    );
    return rows[0] ?? null;
}

export async function createAttendance(
    input: AttendanceInput,
): Promise<Attendance> {
    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO attendance (student_id, session_id, status) VALUES (?, ?, ?)`,
        [input.studentId, input.sessionId, input.status],
    );

    return (await getAttendanceById(result.insertId))!;
}

export async function getAttendance(filters: AttendanceFilters){
    const conditions: string[] = [];
    const params: (number | string)[] = [];

    if(filters.studentId !== undefined){
        conditions.push("student_id = ?");
        params.push(filters.studentId);
    }

    if (filters.sessionId !== undefined) {
        conditions.push("session_id = ?");
        params.push(filters.sessionId);
    }

    if (filters.status !== undefined) {
        conditions.push("status = ?");
        params.push(filters.status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await db.query<AttendanceRow[]>(
        `SELECT * FROM attendance ${whereClause} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [...params, filters.limit, filters.offset],
    );

    return rows;
}

export async function deleteAttendance(id: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
        `DELETE FROM attendance WHERE id = ?`,
        [id],
    );
    return result.affectedRows > 0;
}

export async function updateAttendance(id: number, data: AttendanceInput): Promise<Attendance | null> {
   const [result] = await db.query<ResultSetHeader>(
        `UPDATE attendance SET student_id = ?, session_id = ?, status = ? WHERE id = ?`,
        [data.studentId, data.sessionId, data.status, id],
    );

    return await getAttendanceById(result.insertId);
}


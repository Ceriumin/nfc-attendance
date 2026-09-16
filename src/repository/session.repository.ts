import { db } from "@/database/connection.ts";
import type { ResultSetHeader } from "mysql2";
import type { Session, SessionInput, SessionRow } from "@/types/session.ts";

export async function getSessionById(id: number): Promise<Session | null> {
    const [rows] = await db.query<SessionRow[]>(
        `SELECT * FROM sessions WHERE id = ?`,
        [id],
    );
    return rows[0] ?? null;
}

export async function getAllSessions(): Promise<Session[]> {
    const [rows] = await db.query<SessionRow[]>(`SELECT * FROM sessions`);
    return rows;
}

export async function getSessionsByClass(classId: number): Promise<Session[]> {
    const [rows] = await db.query<SessionRow[]>(
        `SELECT * FROM sessions WHERE class_id = ?`,
        [classId],
    );
    return rows;
}

export async function createSession(data: SessionInput): Promise<Session> {
    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO sessions (day, start_time, end_time, class_id)
         VALUES (?, ?, ?, ?)`,
        [data.day, data.startTime, data.endTime, data.classId],
    );

    // The row was just inserted, so it always exists.
    return (await getSessionById(result.insertId))!;
}

export async function updateSession(
    id: number,
    data: SessionInput,
): Promise<Session | null> {
    await db.query<ResultSetHeader>(
        `UPDATE sessions SET day = ?, start_time = ?, end_time = ?, class_id = ? WHERE id = ?`,
        [data.day, data.startTime, data.endTime, data.classId, id],
    );

    return await getSessionById(id);
}

export async function deleteSession(id: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
        `DELETE FROM sessions WHERE id = ?`,
        [id],
    );
    return result.affectedRows > 0;
}

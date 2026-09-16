import { db } from "@/database/connection.ts";
import type { ResultSetHeader } from "mysql2";
import type { Class, ClassInput, ClassRow } from "@/types/class.ts";

export async function getClassById(id: number): Promise<Class | null> {
    const [rows] = await db.query<ClassRow[]>(
        `SELECT * FROM classes WHERE id = ?`,
        [id],
    );
    return rows[0] ?? null;
}

export async function getAllClasses(): Promise<Class[]> {
    const [rows] = await db.query<ClassRow[]>(`SELECT * FROM classes`);
    return rows;
}

export async function createClass(data: ClassInput): Promise<Class> {
    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO classes (name) VALUES (?)`,
        [data.name],
    );

    // The row was just inserted, so it always exists.
    return (await getClassById(result.insertId))!;
}

export async function updateClass(
    id: number,
    data: ClassInput,
): Promise<Class | null> {
    await db.query<ResultSetHeader>(
        `UPDATE classes SET name = ? WHERE id = ?`,
        [data.name, id],
    );

    return await getClassById(id);
}

export async function deleteClass(id: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
        `DELETE FROM classes WHERE id = ?`,
        [id],
    );
    return result.affectedRows > 0;
}

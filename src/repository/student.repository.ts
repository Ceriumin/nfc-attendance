import { db } from "@/database/connection.ts";
import type { ResultSetHeader } from "mysql2";
import type { Student, StudentInput, StudentRow } from "@/types/student.ts";

export async function getStudentById(id: number): Promise<Student | null> {
    const [rows] = await db.query<StudentRow[]>(
        `SELECT * FROM students WHERE id = ?`,
        [id],
    );
    return rows[0] ?? null;
}

export async function getAllStudents(): Promise<Student[]> {
    const [rows] = await db.query<StudentRow[]>(`SELECT * FROM students`);
    return rows;
}

export async function createStudent(data: StudentInput): Promise<Student> {
    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO students (first_name, last_name, email, course)
         VALUES (?, ?, ?, ?)`,
        [data.firstName, data.lastName, data.email, data.course],
    );

    // The row was just inserted, so it always exists.
    return (await getStudentById(result.insertId))!;
}

export async function updateStudent(
    id: number,
    data: StudentInput,
): Promise<Student | null> {
    await db.query<ResultSetHeader>(
        `UPDATE students SET first_name = ?, last_name = ?, email = ?, course = ? WHERE id = ?`,
        [data.firstName, data.lastName, data.email, data.course, id],
    );

    return await getStudentById(id);
}

export async function deleteStudent(id: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
        `DELETE FROM students WHERE id = ?`,
        [id],
    );
    return result.affectedRows > 0;
}

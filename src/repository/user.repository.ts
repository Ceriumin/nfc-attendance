import { db } from "@/database/connection.ts";
import type { ResultSetHeader } from "mysql2";
import type { User, UserRow } from "@/types/user.ts";
import type { UserRole } from "@/types/jwt.ts";

export async function getUserById(id: number): Promise<User | null> {
    const [rows] = await db.query<UserRow[]>(
        `SELECT * FROM users WHERE id = ?`,
        [id],
    );
    return rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const [rows] = await db.query<UserRow[]>(
        `SELECT * FROM users WHERE email = ?`,
        [email],
    );
    return rows[0] ?? null;
}

export async function createUser(data: {
    email: string;
    passwordHash: string;
    role: UserRole;
    studentId?: number;
}): Promise<User> {
    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO users (email, password_hash, role, student_id)
         VALUES (?, ?, ?, ?)`,
        [data.email, data.passwordHash, data.role, data.studentId ?? null],
    );

    return (await getUserById(result.insertId))!;
}

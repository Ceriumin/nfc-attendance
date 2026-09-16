import type { RowDataPacket } from "mysql2";
import type { UserRole } from "@/types/jwt.ts";

export interface User {
    id: number;
    email: string;
    password_hash: string;
    role: UserRole;
    student_id: number | null;
    created_at: Date;
}

export interface UserInput {
    email: string;
    password: string; // plaintext in; the service hashes it before persisting
    role: UserRole;
    studentId?: number;
}

/* ————————— Public / API-safe shape (never leaks the hash) ————————— */

export type SafeUser = Omit<User, "password_hash">;

/* ————————— Database Row Types ————————— */

export type UserRow = User & RowDataPacket;

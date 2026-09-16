export type UserRole = "student" | "teacher" | "admin";

export interface JwtPayload {
    id: number;
    role: UserRole;
    email: string;
    studentId?: number;
    iat?: number;
    exp?: number;
}

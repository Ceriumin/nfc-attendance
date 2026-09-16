import type { RowDataPacket } from "mysql2";
import { db } from "../connection.ts";
import { hashPassword } from "../../utils/password.ts";
import type { UserRole } from "../../types/jwt.ts";

/**
 * Shared password for every seeded account — dev convenience only.
 * These credentials are for a local/seeded database; never seed real users this way.
 */
const DEFAULT_PASSWORD = "Password123!";

const ADMIN = { email: "admin@school.edu" };

const TEACHERS = [
    { email: "alice.turner@school.edu" },
    { email: "brian.cole@school.edu" },
    { email: "carla.mendez@school.edu" },
];

/** How many of the existing students to give login accounts. */
const STUDENT_ACCOUNTS = 8;

type SeedRow = [email: string, passwordHash: string, role: UserRole, studentId: number | null];

/** Read a handful of already-seeded students to attach student-role logins to. */
async function getStudents(limit: number): Promise<Array<{ id: number; email: string }>> {
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT id, email FROM students ORDER BY id LIMIT ?",
        [limit],
    );
    return rows.map((row) => ({ id: row.id as number, email: row.email as string }));
}

async function buildRows(): Promise<SeedRow[]> {
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

    const staff: SeedRow[] = [
        [ADMIN.email, passwordHash, "admin", null],
        ...TEACHERS.map((t): SeedRow => [t.email, passwordHash, "teacher", null]),
    ];

    const students = await getStudents(STUDENT_ACCOUNTS);
    const studentRows: SeedRow[] = students.map((s) => [
        s.email,
        passwordHash,
        "student",
        s.id,
    ]);

    return [...staff, ...studentRows];
}

async function seedUsers() {
    const rows = await buildRows();

    // INSERT IGNORE keeps the seed re-runnable: existing emails (UNIQUE) are skipped.
    await db.query(
        "INSERT IGNORE INTO users (email, password_hash, role, student_id) VALUES ?",
        [rows],
    );

    const counts = rows.reduce<Record<UserRole, number>>(
        (acc, [, , role]) => ({ ...acc, [role]: (acc[role] ?? 0) + 1 }),
        {} as Record<UserRole, number>,
    );

    console.log(
        `✔ Seeded users — ${counts.admin ?? 0} admin, ${counts.teacher ?? 0} teachers, ` +
            `${counts.student ?? 0} students`,
    );
    console.log(`  Login with any seeded email and password: ${DEFAULT_PASSWORD}`);
    console.log(`  e.g. ${ADMIN.email} (admin), ${TEACHERS[0].email}  (teacher)`);
}

try {
    await seedUsers();
    await db.end();
} catch (error) {
    console.error("× Failed to seed users:", error);
    await db.end();
    process.exit(1);
}

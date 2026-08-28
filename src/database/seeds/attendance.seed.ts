import { faker } from "@faker-js/faker";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../connection.ts";

const CLASS_NAMES = [
    "Intro to Programming",
    "Databases",
    "Web Development",
    "Data Structures",
    "Operating Systems",
    "Networking",
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
const STATUSES = ["present", "late", "absent"] as const;

/** Read the students already seeded by student.seed.ts. */
async function getStudentIds(): Promise<number[]> {
    const [rows] = await db.query<RowDataPacket[]>("SELECT id FROM students");
    return rows.map((row) => row.id as number);
}

/** Insert classes, then read their generated ids back. */
async function seedClasses(): Promise<number[]> {
    const values = CLASS_NAMES.map((name) => [name]);
    await db.query("INSERT INTO classes (name) VALUES ?", [values]);

    const [rows] = await db.query<RowDataPacket[]>("SELECT id FROM classes");
    return rows.map((row) => row.id as number);
}

/** One or two weekly sessions per class. Returns rows keyed by class. */
async function seedSessions(
    classIds: number[],
): Promise<Array<{ id: number; classId: number }>> {
    const values = classIds.flatMap((classId) =>
        faker.helpers.arrayElements(DAYS, { min: 1, max: 2 }).map((day) => {
            const startHour = faker.number.int({ min: 8, max: 16 });
            return [
                day,
                `${String(startHour).padStart(2, "0")}:00:00`,
                `${String(startHour + 1).padStart(2, "0")}:00:00`,
                classId,
            ];
        }),
    );

    await db.query(
        "INSERT INTO sessions (day, start_time, end_time, class_id) VALUES ?",
        [values],
    );

    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT id, class_id FROM sessions",
    );
    return rows.map((row) => ({ id: row.id as number, classId: row.class_id as number }));
}

/** One NFC card per student, with a unique UID. */
async function seedCards(studentIds: number[]): Promise<void> {
    const usedUids = new Set<string>();
    const values = studentIds.map((studentId) => {
        let uid = faker.string.hexadecimal({ length: 14, prefix: "" });
        while (usedUids.has(uid)) {
            uid = faker.string.hexadecimal({ length: 14, prefix: "" });
        }
        usedUids.add(uid);
        return [studentId, uid.toUpperCase()];
    });

    await db.query("INSERT INTO cards (student_id, card_uid) VALUES ?", [values]);
}

/**
 * Enrol each student in a distinct subset of classes.
 * arrayElements guarantees no duplicate class per student -> respects UNIQUE(student_id, class_id).
 * Returns the (student, class) pairs so attendance can be built from them.
 */
async function seedEnrolments(
    studentIds: number[],
    classIds: number[],
): Promise<Array<{ studentId: number; classId: number }>> {
    const pairs = studentIds.flatMap((studentId) =>
        faker.helpers
            .arrayElements(classIds, { min: 1, max: 3 })
            .map((classId) => ({ studentId, classId })),
    );

    await db.query("INSERT INTO enrolments (student_id, class_id) VALUES ?", [
        pairs.map((p) => [p.studentId, p.classId]),
    ]);

    return pairs;
}

/**
 * For each enrolment, create one attendance row per session in that class.
 * Each (student, session) pair is unique by construction -> respects UNIQUE(student_id, session_id).
 */
async function seedAttendance(
    enrolments: Array<{ studentId: number; classId: number }>,
    sessions: Array<{ id: number; classId: number }>,
): Promise<void> {
    const sessionsByClass = new Map<number, number[]>();
    for (const session of sessions) {
        const list = sessionsByClass.get(session.classId) ?? [];
        list.push(session.id);
        sessionsByClass.set(session.classId, list);
    }

    const values = enrolments.flatMap(({ studentId, classId }) =>
        (sessionsByClass.get(classId) ?? []).map((sessionId) => [
            studentId,
            sessionId,
            faker.helpers.weightedArrayElement([
                { value: "present", weight: 7 },
                { value: "late", weight: 2 },
                { value: "absent", weight: 1 },
            ]),
        ]),
    );

    if (values.length === 0) return;

    await db.query(
        "INSERT INTO attendance (student_id, session_id, status) VALUES ?",
        [values],
    );
}

async function seed() {
    const studentIds = await getStudentIds();
    if (studentIds.length === 0) {
        throw new Error("No students found — run `npm run seed:students` first.");
    }

    const classIds = await seedClasses();
    const sessions = await seedSessions(classIds);

    await seedCards(studentIds);
    const enrolments = await seedEnrolments(studentIds, classIds);
    await seedAttendance(enrolments, sessions);

    console.log(
        `✔ Seeded ${classIds.length} classes, ${sessions.length} sessions, ` +
            `${studentIds.length} cards, ${enrolments.length} enrolments`,
    );
}

try {
    await seed();
    await db.end();
} catch (error) {
    console.error("× Failed to seed attendance data:", error);
    await db.end();
    process.exit(1);
}

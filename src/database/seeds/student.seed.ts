import { faker } from "@faker-js/faker";
import { db } from "../connection.ts";

const COURSES = [
    "Computer Science",
    "Information Technology",
    "Business Administration",
    "Accounting",
    "Nursing",
    "Engineering",
    "Psychology",
    "Education",
];

async function seedStudents() {
    const students = Array.from({ length: 25 }, () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        return [
            firstName,
            lastName,
            faker.internet.email({
                firstName,
                lastName,
            }).toLowerCase(),
            faker.helpers.arrayElement(COURSES),
        ];
    });

    await db.query(
        `
        INSERT INTO students (
            first_name,
            last_name,
            email,
            course
        )
        VALUES ?
        `,
        [students],
    );

    console.log(`✔ Seeded ${students.length} students`);
}

try {
    await seedStudents();
    await db.end();
} catch (error) {
    console.error("× Failed to seed students:", error);
    await db.end();
    process.exit(1);
}
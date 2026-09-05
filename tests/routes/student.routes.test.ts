// NOTE: These are HTTP-level integration tests. They require `supertest`:
//   npm i -D supertest @types/supertest
// Until it's installed the import below will fail — that's expected.
import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the service layer so routes/controllers are exercised without a database.
vi.mock("@/services/student.service.ts");

import app from "../../src/app.ts";
import * as studentService from "../../src/services/student.service.ts";
import { NotFoundError, ValidationError } from "../../src/utils/AppError.ts";
import type { Student } from "../../src/types/student.ts";

const fakeStudent: Student = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "johndoe@example.com",
    course: "BTech",
    created_at: new Date("2026-01-01T00:00:00"),
    updated_at: new Date("2026-01-01T00:00:00"),
};

const validBody = {
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    course: "BTech",
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("GET /api/students", () => {
    test("returns 200 with the list", async () => {
        vi.mocked(studentService.getAllStudents).mockResolvedValue([fakeStudent]);

        const res = await request(app).get("/api/students");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });
});

describe("GET /api/students/:id", () => {
    test("returns 200 with the student", async () => {
        vi.mocked(studentService.getStudentById).mockResolvedValue(fakeStudent);

        const res = await request(app).get("/api/students/1");

        expect(res.status).toBe(200);
        expect(studentService.getStudentById).toHaveBeenCalledWith(1);
    });

    test("returns 404 when the service throws NotFoundError", async () => {
        vi.mocked(studentService.getStudentById).mockRejectedValue(new NotFoundError("Student not found"));

        const res = await request(app).get("/api/students/999");

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: "Student not found" });
    });
});

describe("POST /api/students", () => {
    test("returns 201 with the created student", async () => {
        vi.mocked(studentService.createStudent).mockResolvedValue(fakeStudent);

        const res = await request(app).post("/api/students").send(validBody);

        expect(res.status).toBe(201);
        expect(studentService.createStudent).toHaveBeenCalledWith(validBody);
    });

    test("returns 400 when the service throws ValidationError", async () => {
        vi.mocked(studentService.createStudent).mockRejectedValue(new ValidationError("bad"));

        const res = await request(app).post("/api/students").send({});

        expect(res.status).toBe(400);
    });
});

describe("PUT /api/students/:id", () => {
    test("returns 200 with the updated student", async () => {
        vi.mocked(studentService.updateStudent).mockResolvedValue(fakeStudent);

        const res = await request(app).put("/api/students/1").send(validBody);

        expect(res.status).toBe(200);
        expect(studentService.updateStudent).toHaveBeenCalledWith(1, validBody);
    });
});

describe("DELETE /api/students/:id", () => {
    test("returns 204 with no body", async () => {
        vi.mocked(studentService.deleteStudent).mockResolvedValue(undefined);

        const res = await request(app).delete("/api/students/1");

        expect(res.status).toBe(204);
        expect(studentService.deleteStudent).toHaveBeenCalledWith(1);
    });
});

describe("unknown route", () => {
    test("falls through to the notFound handler with a 404", async () => {
        const res = await request(app).get("/api/students/1/nope/nope");

        expect(res.status).toBe(404);
    });
});

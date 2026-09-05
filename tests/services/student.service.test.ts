import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("@/repository/student.repository.ts");

import * as studentService from "../../src/services/student.service.ts";
import * as studentRepository from "../../src/repository/student.repository.ts";
import { ValidationError, NotFoundError, ConflictError } from "../../src/utils/AppError.ts";
import type { Student, StudentInput } from "../../src/types/student.ts";

const fakeStudent: Student = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "johndoe@example.com",
    course: "BTech",
    created_at: new Date("2026-01-01T00:00:00"),
    updated_at: new Date("2026-01-01T00:00:00"),
};

const validInput: StudentInput = {
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    course: "BTech",
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getStudentById", () => {
    test("rejects a non-positive id before hitting the database", async () => {
        await expect(studentService.getStudentById(0)).rejects.toThrow(ValidationError);
        expect(studentRepository.getStudentById).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when the repository returns null", async () => {
        vi.mocked(studentRepository.getStudentById).mockResolvedValue(null);

        await expect(studentService.getStudentById(999)).rejects.toThrow(NotFoundError);
    });

    test("returns the student when it exists", async () => {
        vi.mocked(studentRepository.getStudentById).mockResolvedValue(fakeStudent);

        await expect(studentService.getStudentById(1)).resolves.toEqual(fakeStudent);
        expect(studentRepository.getStudentById).toHaveBeenCalledWith(1);
    });
});

describe("getAllStudents", () => {
    test("returns whatever the repository provides", async () => {
        vi.mocked(studentRepository.getAllStudents).mockResolvedValue([fakeStudent]);

        await expect(studentService.getAllStudents()).resolves.toEqual([fakeStudent]);
    });
});

describe("createStudent", () => {
    test("rejects input missing required fields with a ValidationError", async () => {
        await expect(
            studentService.createStudent({ firstName: "John", lastName: "Doe" }),
        ).rejects.toThrow(ValidationError);

        expect(studentRepository.createStudent).not.toHaveBeenCalled();
    });

    test("saves valid input and returns the created student", async () => {
        vi.mocked(studentRepository.createStudent).mockResolvedValue(fakeStudent);

        const result = await studentService.createStudent(validInput);

        expect(result).toEqual(fakeStudent);
        expect(studentRepository.createStudent).toHaveBeenCalledWith(validInput);
    });

    test("translates a duplicate-email DB error into a ConflictError", async () => {
        vi.mocked(studentRepository.createStudent).mockRejectedValue({ code: "ER_DUP_ENTRY" });

        await expect(studentService.createStudent(validInput)).rejects.toThrow(ConflictError);
    });
});

describe("updateStudent", () => {
    test("rejects a non-positive id before validating input", async () => {
        await expect(studentService.updateStudent(0, validInput)).rejects.toThrow(ValidationError);
        expect(studentRepository.updateStudent).not.toHaveBeenCalled();
    });

    test("rejects input missing required fields with a ValidationError", async () => {
        await expect(studentService.updateStudent(1, { firstName: "John" })).rejects.toThrow(
            ValidationError,
        );
        expect(studentRepository.updateStudent).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when the repository returns null", async () => {
        vi.mocked(studentRepository.updateStudent).mockResolvedValue(null);

        await expect(studentService.updateStudent(999, validInput)).rejects.toThrow(NotFoundError);
    });

    test("translates a duplicate-email DB error into a ConflictError", async () => {
        vi.mocked(studentRepository.updateStudent).mockRejectedValue({ code: "ER_DUP_ENTRY" });

        await expect(studentService.updateStudent(1, validInput)).rejects.toThrow(ConflictError);
    });

    test("returns the updated student on success", async () => {
        vi.mocked(studentRepository.updateStudent).mockResolvedValue(fakeStudent);

        const result = await studentService.updateStudent(1, validInput);

        expect(result).toEqual(fakeStudent);
        expect(studentRepository.updateStudent).toHaveBeenCalledWith(1, validInput);
    });
});

describe("deleteStudent", () => {
    test("rejects a non-positive id before hitting the database", async () => {
        await expect(studentService.deleteStudent(0)).rejects.toThrow(ValidationError);
        expect(studentRepository.deleteStudent).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when nothing was deleted", async () => {
        vi.mocked(studentRepository.deleteStudent).mockResolvedValue(false);

        await expect(studentService.deleteStudent(999)).rejects.toThrow(NotFoundError);
    });

    test("resolves when a student is deleted", async () => {
        vi.mocked(studentRepository.deleteStudent).mockResolvedValue(true);

        await expect(studentService.deleteStudent(1)).resolves.toBeUndefined();
        expect(studentRepository.deleteStudent).toHaveBeenCalledWith(1);
    });
});

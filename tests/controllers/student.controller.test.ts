import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/services/student.service.ts");

import * as studentController from "../../src/controllers/student.controller.ts";
import * as studentService from "../../src/services/student.service.ts";
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

function mockRes() {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
}

const next = vi.fn() as unknown as NextFunction;

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getAllStudents", () => {
    test("responds 200 with the list of students", async () => {
        vi.mocked(studentService.getAllStudents).mockResolvedValue([fakeStudent]);
        const res = mockRes();

        await studentController.getAllStudents({} as Request, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([fakeStudent]);
        expect(next).not.toHaveBeenCalled();
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(studentService.getAllStudents).mockRejectedValue(err);
        const res = mockRes();

        await studentController.getAllStudents({} as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("getStudentById", () => {
    test("responds 200 with the student, coercing the id param to a number", async () => {
        vi.mocked(studentService.getStudentById).mockResolvedValue(fakeStudent);
        const res = mockRes();

        await studentController.getStudentById({ params: { id: "1" } } as unknown as Request, res, next);

        expect(studentService.getStudentById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeStudent);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(studentService.getStudentById).mockRejectedValue(err);
        const res = mockRes();

        await studentController.getStudentById({ params: { id: "1" } } as unknown as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("createStudent", () => {
    test("responds 201 with the created student", async () => {
        vi.mocked(studentService.createStudent).mockResolvedValue(fakeStudent);
        const res = mockRes();
        const body = { firstName: "John", lastName: "Doe", email: "johndoe@example.com", course: "BTech" };

        await studentController.createStudent({ body } as Request, res, next);

        expect(studentService.createStudent).toHaveBeenCalledWith(body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(fakeStudent);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(studentService.createStudent).mockRejectedValue(err);
        const res = mockRes();

        await studentController.createStudent({ body: {} } as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("updateStudent", () => {
    test("responds 200 with the updated student", async () => {
        vi.mocked(studentService.updateStudent).mockResolvedValue(fakeStudent);
        const res = mockRes();
        const body = { firstName: "John", lastName: "Doe", email: "johndoe@example.com", course: "BTech" };

        await studentController.updateStudent({ params: { id: "1" }, body } as unknown as Request, res, next);

        expect(studentService.updateStudent).toHaveBeenCalledWith(1, body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeStudent);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(studentService.updateStudent).mockRejectedValue(err);
        const res = mockRes();

        await studentController.updateStudent({ params: { id: "1" }, body: {} } as unknown as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("deleteStudent", () => {
    test("responds 204 with an empty body", async () => {
        vi.mocked(studentService.deleteStudent).mockResolvedValue(undefined);
        const res = mockRes();

        await studentController.deleteStudent({ params: { id: "1" } } as unknown as Request, res, next);

        expect(studentService.deleteStudent).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(studentService.deleteStudent).mockRejectedValue(err);
        const res = mockRes();

        await studentController.deleteStudent({ params: { id: "1" } } as unknown as Request, res, next);

        expect(next).toHaveBeenCalledWith(err);
    });
});

import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("@/repository/enrolment.repository.ts");

import * as enrolmentService from "../../src/services/enrolment.service.ts";
import * as enrolmentRepository from "../../src/repository/enrolment.repository.ts";
import { ValidationError, NotFoundError, ConflictError } from "../../src/utils/AppError.ts";
import type { Enrolment, EnrolmentInput } from "../../src/types/enrolment.ts";

const fakeEnrolment: Enrolment = { id: 1, student_id: 1, class_id: 1 };
const validInput: EnrolmentInput = { studentId: 1, classId: 1 };

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getEnrolmentById", () => {
    test("rejects a non-positive id before hitting the database", async () => {
        await expect(enrolmentService.getEnrolmentById(0)).rejects.toThrow(ValidationError);
        expect(enrolmentRepository.getEnrolmentById).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when the repository returns null", async () => {
        vi.mocked(enrolmentRepository.getEnrolmentById).mockResolvedValue(null);
        await expect(enrolmentService.getEnrolmentById(999)).rejects.toThrow(NotFoundError);
    });

    test("returns the enrolment when it exists", async () => {
        vi.mocked(enrolmentRepository.getEnrolmentById).mockResolvedValue(fakeEnrolment);
        await expect(enrolmentService.getEnrolmentById(1)).resolves.toEqual(fakeEnrolment);
    });
});

describe("getEnrolments", () => {
    test("with no query returns all enrolments", async () => {
        vi.mocked(enrolmentRepository.getAllEnrolments).mockResolvedValue([fakeEnrolment]);
        await expect(enrolmentService.getEnrolments({})).resolves.toEqual([fakeEnrolment]);
        expect(enrolmentRepository.getAllEnrolments).toHaveBeenCalled();
    });

    test("with a studentId filters by student", async () => {
        vi.mocked(enrolmentRepository.getEnrolmentsByStudent).mockResolvedValue([fakeEnrolment]);
        await enrolmentService.getEnrolments({ studentId: "3" });
        expect(enrolmentRepository.getEnrolmentsByStudent).toHaveBeenCalledWith(3);
    });

    test("with a classId filters by class", async () => {
        vi.mocked(enrolmentRepository.getEnrolmentsByClass).mockResolvedValue([fakeEnrolment]);
        await enrolmentService.getEnrolments({ classId: "5" });
        expect(enrolmentRepository.getEnrolmentsByClass).toHaveBeenCalledWith(5);
    });

    test("rejects an invalid studentId", async () => {
        await expect(enrolmentService.getEnrolments({ studentId: "abc" })).rejects.toThrow(ValidationError);
    });
});

describe("createEnrolment", () => {
    test("rejects input missing ids with a ValidationError", async () => {
        await expect(enrolmentService.createEnrolment({ studentId: 1 })).rejects.toThrow(ValidationError);
        expect(enrolmentRepository.createEnrolment).not.toHaveBeenCalled();
    });

    test("saves valid input and returns the created enrolment", async () => {
        vi.mocked(enrolmentRepository.createEnrolment).mockResolvedValue(fakeEnrolment);
        const result = await enrolmentService.createEnrolment(validInput);
        expect(result).toEqual(fakeEnrolment);
        expect(enrolmentRepository.createEnrolment).toHaveBeenCalledWith(validInput);
    });

    test("translates a duplicate DB error into a ConflictError", async () => {
        vi.mocked(enrolmentRepository.createEnrolment).mockRejectedValue({ code: "ER_DUP_ENTRY" });
        await expect(enrolmentService.createEnrolment(validInput)).rejects.toThrow(ConflictError);
    });

    test("translates a missing-reference DB error into a ValidationError", async () => {
        vi.mocked(enrolmentRepository.createEnrolment).mockRejectedValue({ code: "ER_NO_REFERENCED_ROW_2" });
        await expect(enrolmentService.createEnrolment(validInput)).rejects.toThrow(ValidationError);
    });
});

describe("deleteEnrolment", () => {
    test("rejects a non-positive id before hitting the database", async () => {
        await expect(enrolmentService.deleteEnrolment(0)).rejects.toThrow(ValidationError);
        expect(enrolmentRepository.deleteEnrolment).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when nothing was deleted", async () => {
        vi.mocked(enrolmentRepository.deleteEnrolment).mockResolvedValue(false);
        await expect(enrolmentService.deleteEnrolment(999)).rejects.toThrow(NotFoundError);
    });

    test("resolves when an enrolment is deleted", async () => {
        vi.mocked(enrolmentRepository.deleteEnrolment).mockResolvedValue(true);
        await expect(enrolmentService.deleteEnrolment(1)).resolves.toBeUndefined();
    });
});

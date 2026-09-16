import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("@/repository/class.repository.ts");

import * as classService from "../../src/services/class.service.ts";
import * as classRepository from "../../src/repository/class.repository.ts";
import { ValidationError, NotFoundError, ConflictError } from "../../src/utils/AppError.ts";
import type { Class, ClassInput } from "../../src/types/class.ts";

const fakeClass: Class = { id: 1, name: "Mathematics" };
const validInput: ClassInput = { name: "Mathematics" };

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getClassById", () => {
    test("rejects a non-positive id before hitting the database", async () => {
        await expect(classService.getClassById(0)).rejects.toThrow(ValidationError);
        expect(classRepository.getClassById).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when the repository returns null", async () => {
        vi.mocked(classRepository.getClassById).mockResolvedValue(null);
        await expect(classService.getClassById(999)).rejects.toThrow(NotFoundError);
    });

    test("returns the class when it exists", async () => {
        vi.mocked(classRepository.getClassById).mockResolvedValue(fakeClass);
        await expect(classService.getClassById(1)).resolves.toEqual(fakeClass);
        expect(classRepository.getClassById).toHaveBeenCalledWith(1);
    });
});

describe("getAllClasses", () => {
    test("returns whatever the repository provides", async () => {
        vi.mocked(classRepository.getAllClasses).mockResolvedValue([fakeClass]);
        await expect(classService.getAllClasses()).resolves.toEqual([fakeClass]);
    });
});

describe("createClass", () => {
    test("rejects input missing a name with a ValidationError", async () => {
        await expect(classService.createClass({})).rejects.toThrow(ValidationError);
        expect(classRepository.createClass).not.toHaveBeenCalled();
    });

    test("saves valid input and returns the created class", async () => {
        vi.mocked(classRepository.createClass).mockResolvedValue(fakeClass);
        const result = await classService.createClass(validInput);
        expect(result).toEqual(fakeClass);
        expect(classRepository.createClass).toHaveBeenCalledWith(validInput);
    });

    test("translates a duplicate-name DB error into a ConflictError", async () => {
        vi.mocked(classRepository.createClass).mockRejectedValue({ code: "ER_DUP_ENTRY" });
        await expect(classService.createClass(validInput)).rejects.toThrow(ConflictError);
    });
});

describe("updateClass", () => {
    test("rejects a non-positive id before validating input", async () => {
        await expect(classService.updateClass(0, validInput)).rejects.toThrow(ValidationError);
        expect(classRepository.updateClass).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when the repository returns null", async () => {
        vi.mocked(classRepository.updateClass).mockResolvedValue(null);
        await expect(classService.updateClass(999, validInput)).rejects.toThrow(NotFoundError);
    });

    test("translates a duplicate-name DB error into a ConflictError", async () => {
        vi.mocked(classRepository.updateClass).mockRejectedValue({ code: "ER_DUP_ENTRY" });
        await expect(classService.updateClass(1, validInput)).rejects.toThrow(ConflictError);
    });

    test("returns the updated class on success", async () => {
        vi.mocked(classRepository.updateClass).mockResolvedValue(fakeClass);
        const result = await classService.updateClass(1, validInput);
        expect(result).toEqual(fakeClass);
        expect(classRepository.updateClass).toHaveBeenCalledWith(1, validInput);
    });
});

describe("deleteClass", () => {
    test("rejects a non-positive id before hitting the database", async () => {
        await expect(classService.deleteClass(0)).rejects.toThrow(ValidationError);
        expect(classRepository.deleteClass).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when nothing was deleted", async () => {
        vi.mocked(classRepository.deleteClass).mockResolvedValue(false);
        await expect(classService.deleteClass(999)).rejects.toThrow(NotFoundError);
    });

    test("translates a referenced-row DB error into a ConflictError", async () => {
        vi.mocked(classRepository.deleteClass).mockRejectedValue({ code: "ER_ROW_IS_REFERENCED_2" });
        await expect(classService.deleteClass(1)).rejects.toThrow(ConflictError);
    });

    test("resolves when a class is deleted", async () => {
        vi.mocked(classRepository.deleteClass).mockResolvedValue(true);
        await expect(classService.deleteClass(1)).resolves.toBeUndefined();
        expect(classRepository.deleteClass).toHaveBeenCalledWith(1);
    });
});

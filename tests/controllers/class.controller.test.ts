import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/services/class.service.ts");

import * as classController from "../../src/controllers/class.controller.ts";
import * as classService from "../../src/services/class.service.ts";
import type { Class } from "../../src/types/class.ts";

const fakeClass: Class = { id: 1, name: "Mathematics" };

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

describe("getAllClasses", () => {
    test("responds 200 with the list", async () => {
        vi.mocked(classService.getAllClasses).mockResolvedValue([fakeClass]);
        const res = mockRes();
        await classController.getAllClasses({} as Request, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([fakeClass]);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(classService.getAllClasses).mockRejectedValue(err);
        await classController.getAllClasses({} as Request, mockRes(), next);
        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("getClassById", () => {
    test("responds 200 with the class, coercing the id param", async () => {
        vi.mocked(classService.getClassById).mockResolvedValue(fakeClass);
        const res = mockRes();
        await classController.getClassById({ params: { id: "1" } } as unknown as Request, res, next);
        expect(classService.getClassById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("createClass", () => {
    test("responds 201 with the created class", async () => {
        vi.mocked(classService.createClass).mockResolvedValue(fakeClass);
        const res = mockRes();
        const body = { name: "Mathematics" };
        await classController.createClass({ body } as Request, res, next);
        expect(classService.createClass).toHaveBeenCalledWith(body);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(classService.createClass).mockRejectedValue(err);
        await classController.createClass({ body: {} } as Request, mockRes(), next);
        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("updateClass", () => {
    test("responds 200 with the updated class", async () => {
        vi.mocked(classService.updateClass).mockResolvedValue(fakeClass);
        const res = mockRes();
        const body = { name: "Physics" };
        await classController.updateClass({ params: { id: "1" }, body } as unknown as Request, res, next);
        expect(classService.updateClass).toHaveBeenCalledWith(1, body);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("deleteClass", () => {
    test("responds 204 with an empty body", async () => {
        vi.mocked(classService.deleteClass).mockResolvedValue(undefined);
        const res = mockRes();
        await classController.deleteClass({ params: { id: "1" } } as unknown as Request, res, next);
        expect(classService.deleteClass).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });
});

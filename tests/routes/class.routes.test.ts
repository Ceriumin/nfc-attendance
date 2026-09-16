import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("@/services/class.service.ts");

import app from "../../src/app.ts";
import * as classService from "../../src/services/class.service.ts";
import { NotFoundError, ValidationError } from "../../src/utils/AppError.ts";
import type { Class } from "../../src/types/class.ts";
import jwt from "jsonwebtoken";

const fakeClass: Class = { id: 1, name: "Mathematics" };
const validBody = { name: "Mathematics" };

beforeEach(() => {
    vi.clearAllMocks();
});

const VALID_TOKEN = jwt.sign(
    { id: 1, role: "admin" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
);

describe("GET /api/classes", () => {
    test("returns 200 with the list", async () => {
        vi.mocked(classService.getAllClasses).mockResolvedValue([fakeClass]);
        const res = await request(app).get("/api/classes").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });
});

describe("GET /api/classes/:id", () => {
    test("returns 200 with the class", async () => {
        vi.mocked(classService.getClassById).mockResolvedValue(fakeClass);
        const res = await request(app).get("/api/classes/1").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(200);
        expect(classService.getClassById).toHaveBeenCalledWith(1);
    });

    test("returns 404 when the service throws NotFoundError", async () => {
        vi.mocked(classService.getClassById).mockRejectedValue(new NotFoundError("Class not found"));
        const res = await request(app).get("/api/classes/999").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(404);
    });
});

describe("POST /api/classes", () => {
    test("returns 201 with the created class", async () => {
        vi.mocked(classService.createClass).mockResolvedValue(fakeClass);
        const res = await request(app).post("/api/classes").set("Authorization", `Bearer ${VALID_TOKEN}`).send(validBody);
        expect(res.status).toBe(201);
        expect(classService.createClass).toHaveBeenCalledWith(validBody);
    });

    test("returns 400 when the service throws ValidationError", async () => {
        vi.mocked(classService.createClass).mockRejectedValue(new ValidationError("bad"));
        const res = await request(app).post("/api/classes").set("Authorization", `Bearer ${VALID_TOKEN}`).send({});
        expect(res.status).toBe(400);
    });
});

describe("PUT /api/classes/:id", () => {
    test("returns 200 with the updated class", async () => {
        vi.mocked(classService.updateClass).mockResolvedValue(fakeClass);
        const res = await request(app).put("/api/classes/1").set("Authorization", `Bearer ${VALID_TOKEN}`).send(validBody);
        expect(res.status).toBe(200);
        expect(classService.updateClass).toHaveBeenCalledWith(1, validBody);
    });
});

describe("DELETE /api/classes/:id", () => {
    test("returns 204 with no body", async () => {
        vi.mocked(classService.deleteClass).mockResolvedValue(undefined);
        const res = await request(app).delete("/api/classes/1").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(204);
        expect(classService.deleteClass).toHaveBeenCalledWith(1);
    });
});

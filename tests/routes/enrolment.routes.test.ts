import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("@/services/enrolment.service.ts");

import app from "../../src/app.ts";
import * as enrolmentService from "../../src/services/enrolment.service.ts";
import { NotFoundError, ValidationError, ConflictError } from "../../src/utils/AppError.ts";
import type { Enrolment } from "../../src/types/enrolment.ts";
import jwt from "jsonwebtoken";

const fakeEnrolment: Enrolment = { id: 1, student_id: 1, class_id: 1 };
const validBody = { studentId: 1, classId: 1 };

beforeEach(() => {
    vi.clearAllMocks();
});

const VALID_TOKEN = jwt.sign(
    { id: 1, role: "admin" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
);

describe("GET /api/enrolments", () => {
    test("returns 200 with the list", async () => {
        vi.mocked(enrolmentService.getEnrolments).mockResolvedValue([fakeEnrolment]);
        const res = await request(app).get("/api/enrolments").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });
});

describe("GET /api/enrolments/:id", () => {
    test("returns 200 with the enrolment", async () => {
        vi.mocked(enrolmentService.getEnrolmentById).mockResolvedValue(fakeEnrolment);
        const res = await request(app).get("/api/enrolments/1").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(200);
        expect(enrolmentService.getEnrolmentById).toHaveBeenCalledWith(1);
    });

    test("returns 404 when the service throws NotFoundError", async () => {
        vi.mocked(enrolmentService.getEnrolmentById).mockRejectedValue(new NotFoundError("Enrolment not found"));
        const res = await request(app).get("/api/enrolments/999").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(404);
    });
});

describe("POST /api/enrolments", () => {
    test("returns 201 with the created enrolment", async () => {
        vi.mocked(enrolmentService.createEnrolment).mockResolvedValue(fakeEnrolment);
        const res = await request(app).post("/api/enrolments").set("Authorization", `Bearer ${VALID_TOKEN}`).send(validBody);
        expect(res.status).toBe(201);
        expect(enrolmentService.createEnrolment).toHaveBeenCalledWith(validBody);
    });

    test("returns 409 when the service throws ConflictError", async () => {
        vi.mocked(enrolmentService.createEnrolment).mockRejectedValue(new ConflictError("already enrolled"));
        const res = await request(app).post("/api/enrolments").set("Authorization", `Bearer ${VALID_TOKEN}`).send(validBody);
        expect(res.status).toBe(409);
    });

    test("returns 400 when the service throws ValidationError", async () => {
        vi.mocked(enrolmentService.createEnrolment).mockRejectedValue(new ValidationError("bad"));
        const res = await request(app).post("/api/enrolments").set("Authorization", `Bearer ${VALID_TOKEN}`).send({});
        expect(res.status).toBe(400);
    });
});

describe("DELETE /api/enrolments/:id", () => {
    test("returns 204 with no body", async () => {
        vi.mocked(enrolmentService.deleteEnrolment).mockResolvedValue(undefined);
        const res = await request(app).delete("/api/enrolments/1").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(204);
        expect(enrolmentService.deleteEnrolment).toHaveBeenCalledWith(1);
    });
});

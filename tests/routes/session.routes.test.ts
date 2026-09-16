import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("@/services/session.service.ts");

import app from "../../src/app.ts";
import * as sessionService from "../../src/services/session.service.ts";
import { NotFoundError, ValidationError } from "../../src/utils/AppError.ts";
import type { Session } from "../../src/types/session.ts";
import jwt from "jsonwebtoken";

const fakeSession: Session = {
    id: 1,
    day: "monday",
    start_time: "09:00:00",
    end_time: "10:00:00",
    class_id: 1,
};

const validBody = { day: "monday", startTime: "09:00", endTime: "10:00", classId: 1 };

beforeEach(() => {
    vi.clearAllMocks();
});

const VALID_TOKEN = jwt.sign(
    { id: 1, role: "admin" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
);

describe("GET /api/sessions", () => {
    test("returns 200 with the list", async () => {
        vi.mocked(sessionService.getSessions).mockResolvedValue([fakeSession]);
        const res = await request(app).get("/api/sessions").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    test("passes the classId query through to the service", async () => {
        vi.mocked(sessionService.getSessions).mockResolvedValue([fakeSession]);
        await request(app).get("/api/sessions?classId=2").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(sessionService.getSessions).toHaveBeenCalledWith(expect.objectContaining({ classId: "2" }));
    });
});

describe("GET /api/sessions/:id", () => {
    test("returns 200 with the session", async () => {
        vi.mocked(sessionService.getSessionById).mockResolvedValue(fakeSession);
        const res = await request(app).get("/api/sessions/1").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(200);
        expect(sessionService.getSessionById).toHaveBeenCalledWith(1);
    });

    test("returns 404 when the service throws NotFoundError", async () => {
        vi.mocked(sessionService.getSessionById).mockRejectedValue(new NotFoundError("Session not found"));
        const res = await request(app).get("/api/sessions/999").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(404);
    });
});

describe("POST /api/sessions", () => {
    test("returns 201 with the created session", async () => {
        vi.mocked(sessionService.createSession).mockResolvedValue(fakeSession);
        const res = await request(app).post("/api/sessions").set("Authorization", `Bearer ${VALID_TOKEN}`).send(validBody);
        expect(res.status).toBe(201);
        expect(sessionService.createSession).toHaveBeenCalledWith(validBody);
    });

    test("returns 400 when the service throws ValidationError", async () => {
        vi.mocked(sessionService.createSession).mockRejectedValue(new ValidationError("bad"));
        const res = await request(app).post("/api/sessions").set("Authorization", `Bearer ${VALID_TOKEN}`).send({});
        expect(res.status).toBe(400);
    });
});

describe("PUT /api/sessions/:id", () => {
    test("returns 200 with the updated session", async () => {
        vi.mocked(sessionService.updateSession).mockResolvedValue(fakeSession);
        const res = await request(app).put("/api/sessions/1").set("Authorization", `Bearer ${VALID_TOKEN}`).send(validBody);
        expect(res.status).toBe(200);
        expect(sessionService.updateSession).toHaveBeenCalledWith(1, validBody);
    });
});

describe("DELETE /api/sessions/:id", () => {
    test("returns 204 with no body", async () => {
        vi.mocked(sessionService.deleteSession).mockResolvedValue(undefined);
        const res = await request(app).delete("/api/sessions/1").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(204);
        expect(sessionService.deleteSession).toHaveBeenCalledWith(1);
    });
});

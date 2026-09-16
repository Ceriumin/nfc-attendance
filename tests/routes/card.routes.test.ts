import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("@/services/card.service.ts");

import app from "../../src/app.ts";
import * as cardService from "../../src/services/card.service.ts";
import { NotFoundError, ConflictError } from "../../src/utils/AppError.ts";
import type { Card } from "../../src/types/card.ts";
import jwt from "jsonwebtoken";

const fakeCard: Card = {
    id: 1,
    student_id: 1,
    card_uid: "04A1B2C3D4",
    created_at: new Date("2026-01-01T00:00:00"),
};

const validBody = { studentId: 1, cardUid: "04A1B2C3D4" };

beforeEach(() => {
    vi.clearAllMocks();
});

const VALID_TOKEN = jwt.sign(
    { id: 1, role: "admin" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
);

describe("GET /api/cards", () => {
    test("returns 200 with the list", async () => {
        vi.mocked(cardService.getCards).mockResolvedValue([fakeCard]);
        const res = await request(app).get("/api/cards").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });
});

describe("GET /api/cards/:id", () => {
    test("returns 200 with the card", async () => {
        vi.mocked(cardService.getCardById).mockResolvedValue(fakeCard);
        const res = await request(app).get("/api/cards/1").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(200);
        expect(cardService.getCardById).toHaveBeenCalledWith(1);
    });

    test("returns 404 when the service throws NotFoundError", async () => {
        vi.mocked(cardService.getCardById).mockRejectedValue(new NotFoundError("Card not found"));
        const res = await request(app).get("/api/cards/999").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(404);
    });
});

describe("POST /api/cards", () => {
    test("returns 201 with the created card", async () => {
        vi.mocked(cardService.createCard).mockResolvedValue(fakeCard);
        const res = await request(app).post("/api/cards").set("Authorization", `Bearer ${VALID_TOKEN}`).send(validBody);
        expect(res.status).toBe(201);
        expect(cardService.createCard).toHaveBeenCalledWith(validBody);
    });

    test("returns 409 when the service throws ConflictError", async () => {
        vi.mocked(cardService.createCard).mockRejectedValue(new ConflictError("duplicate"));
        const res = await request(app).post("/api/cards").set("Authorization", `Bearer ${VALID_TOKEN}`).send(validBody);
        expect(res.status).toBe(409);
    });
});

describe("DELETE /api/cards/:id", () => {
    test("returns 204 with no body", async () => {
        vi.mocked(cardService.deleteCard).mockResolvedValue(undefined);
        const res = await request(app).delete("/api/cards/1").set("Authorization", `Bearer ${VALID_TOKEN}`);
        expect(res.status).toBe(204);
        expect(cardService.deleteCard).toHaveBeenCalledWith(1);
    });
});

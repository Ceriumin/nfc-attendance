import { describe, test, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/services/card.service.ts");

import * as cardController from "../../src/controllers/card.controller.ts";
import * as cardService from "../../src/services/card.service.ts";
import type { Card } from "../../src/types/card.ts";

const fakeCard: Card = {
    id: 1,
    student_id: 1,
    card_uid: "04A1B2C3D4",
    created_at: new Date("2026-01-01T00:00:00"),
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

describe("getCards", () => {
    test("responds 200 with the list, passing the query through", async () => {
        vi.mocked(cardService.getCards).mockResolvedValue([fakeCard]);
        const res = mockRes();
        await cardController.getCards({ query: { studentId: "1" } } as unknown as Request, res, next);
        expect(cardService.getCards).toHaveBeenCalledWith({ studentId: "1" });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(cardService.getCards).mockRejectedValue(err);
        await cardController.getCards({ query: {} } as unknown as Request, mockRes(), next);
        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("getCardById", () => {
    test("responds 200 with the card, coercing the id param", async () => {
        vi.mocked(cardService.getCardById).mockResolvedValue(fakeCard);
        const res = mockRes();
        await cardController.getCardById({ params: { id: "1" } } as unknown as Request, res, next);
        expect(cardService.getCardById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("createCard", () => {
    test("responds 201 with the created card", async () => {
        vi.mocked(cardService.createCard).mockResolvedValue(fakeCard);
        const res = mockRes();
        const body = { studentId: 1, cardUid: "04A1B2C3D4" };
        await cardController.createCard({ body } as Request, res, next);
        expect(cardService.createCard).toHaveBeenCalledWith(body);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("forwards service errors to next", async () => {
        const err = new Error("boom");
        vi.mocked(cardService.createCard).mockRejectedValue(err);
        await cardController.createCard({ body: {} } as Request, mockRes(), next);
        expect(next).toHaveBeenCalledWith(err);
    });
});

describe("deleteCard", () => {
    test("responds 204 with an empty body", async () => {
        vi.mocked(cardService.deleteCard).mockResolvedValue(undefined);
        const res = mockRes();
        await cardController.deleteCard({ params: { id: "1" } } as unknown as Request, res, next);
        expect(cardService.deleteCard).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });
});

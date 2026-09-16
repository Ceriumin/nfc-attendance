import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("@/repository/card.repository.ts");

import * as cardService from "../../src/services/card.service.ts";
import * as cardRepository from "../../src/repository/card.repository.ts";
import { ValidationError, NotFoundError, ConflictError } from "../../src/utils/AppError.ts";
import type { Card, CardInput } from "../../src/types/card.ts";

const fakeCard: Card = {
    id: 1,
    student_id: 1,
    card_uid: "04A1B2C3D4",
    created_at: new Date("2026-01-01T00:00:00"),
};

const validInput: CardInput = { studentId: 1, cardUid: "04A1B2C3D4" };

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getCardById", () => {
    test("rejects a non-positive id before hitting the database", async () => {
        await expect(cardService.getCardById(0)).rejects.toThrow(ValidationError);
        expect(cardRepository.getCardById).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when the repository returns null", async () => {
        vi.mocked(cardRepository.getCardById).mockResolvedValue(null);
        await expect(cardService.getCardById(999)).rejects.toThrow(NotFoundError);
    });

    test("returns the card when it exists", async () => {
        vi.mocked(cardRepository.getCardById).mockResolvedValue(fakeCard);
        await expect(cardService.getCardById(1)).resolves.toEqual(fakeCard);
    });
});

describe("getCards", () => {
    test("with no query returns all cards", async () => {
        vi.mocked(cardRepository.getAllCards).mockResolvedValue([fakeCard]);
        await expect(cardService.getCards({})).resolves.toEqual([fakeCard]);
        expect(cardRepository.getAllCards).toHaveBeenCalled();
    });

    test("with a studentId filters by student", async () => {
        vi.mocked(cardRepository.getCardsByStudent).mockResolvedValue([fakeCard]);
        await cardService.getCards({ studentId: "7" });
        expect(cardRepository.getCardsByStudent).toHaveBeenCalledWith(7);
    });

    test("rejects an invalid studentId", async () => {
        await expect(cardService.getCards({ studentId: "abc" })).rejects.toThrow(ValidationError);
    });
});

describe("createCard", () => {
    test("rejects a missing studentId with a ValidationError", async () => {
        await expect(cardService.createCard({ cardUid: "04A1" })).rejects.toThrow(ValidationError);
        expect(cardRepository.createCard).not.toHaveBeenCalled();
    });

    test("rejects a missing cardUid with a ValidationError", async () => {
        await expect(cardService.createCard({ studentId: 1 })).rejects.toThrow(ValidationError);
    });

    test("rejects a cardUid longer than 64 characters", async () => {
        await expect(
            cardService.createCard({ studentId: 1, cardUid: "x".repeat(65) }),
        ).rejects.toThrow(ValidationError);
    });

    test("saves valid input and returns the created card", async () => {
        vi.mocked(cardRepository.createCard).mockResolvedValue(fakeCard);
        const result = await cardService.createCard(validInput);
        expect(result).toEqual(fakeCard);
        expect(cardRepository.createCard).toHaveBeenCalledWith(validInput);
    });

    test("translates a duplicate-uid DB error into a ConflictError", async () => {
        vi.mocked(cardRepository.createCard).mockRejectedValue({ code: "ER_DUP_ENTRY" });
        await expect(cardService.createCard(validInput)).rejects.toThrow(ConflictError);
    });

    test("translates a missing-reference DB error into a ValidationError", async () => {
        vi.mocked(cardRepository.createCard).mockRejectedValue({ code: "ER_NO_REFERENCED_ROW_2" });
        await expect(cardService.createCard(validInput)).rejects.toThrow(ValidationError);
    });
});

describe("deleteCard", () => {
    test("rejects a non-positive id before hitting the database", async () => {
        await expect(cardService.deleteCard(0)).rejects.toThrow(ValidationError);
        expect(cardRepository.deleteCard).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when nothing was deleted", async () => {
        vi.mocked(cardRepository.deleteCard).mockResolvedValue(false);
        await expect(cardService.deleteCard(999)).rejects.toThrow(NotFoundError);
    });

    test("resolves when a card is deleted", async () => {
        vi.mocked(cardRepository.deleteCard).mockResolvedValue(true);
        await expect(cardService.deleteCard(1)).resolves.toBeUndefined();
    });
});

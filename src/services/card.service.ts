import * as cardRepository from "@/repository/card.repository.ts";
import { NotFoundError, ValidationError, ConflictError } from "@/utils/AppError.ts";
import { isDuplicateKeyError, isMissingReferenceError } from "@/utils/dbErrors.ts";
import type { Card, CardInput } from "@/types/card.ts";

function assertValidId(id: number): void {
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError("Invalid card ID");
    }
}

function assertValidInput(input: unknown): asserts input is CardInput {
    const data = input as Partial<CardInput> | null | undefined;
    if (!Number.isInteger(data?.studentId)) {
        throw new ValidationError("A valid studentId is required");
    }
    if (!data?.cardUid || typeof data.cardUid !== "string" || data.cardUid.length > 64) {
        throw new ValidationError("cardUid is required and must be at most 64 characters");
    }
}

export async function getCardById(id: number): Promise<Card> {
    assertValidId(id);

    const found = await cardRepository.getCardById(id);
    if (!found) throw new NotFoundError("Card not found");

    return found;
}

export async function getCards(query: Record<string, unknown>): Promise<Card[]> {
    if (query.studentId !== undefined) {
        const studentId = Number(query.studentId);
        if (!Number.isInteger(studentId) || studentId < 1) {
            throw new ValidationError("Invalid studentId");
        }
        return cardRepository.getCardsByStudent(studentId);
    }

    return cardRepository.getAllCards();
}

export async function createCard(input: unknown): Promise<Card> {
    assertValidInput(input);

    try {
        return await cardRepository.createCard(input);
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            throw new ConflictError(`Card '${input.cardUid}' is already registered`);
        }
        if (isMissingReferenceError(err)) {
            throw new ValidationError("The referenced student does not exist");
        }
        throw err;
    }
}

export async function deleteCard(id: number): Promise<void> {
    assertValidId(id);

    const deleted = await cardRepository.deleteCard(id);
    if (!deleted) throw new NotFoundError("Card not found");
}

import * as sessionRepository from "@/repository/session.repository.ts";
import { NotFoundError, ValidationError, ConflictError } from "@/utils/AppError.ts";
import { isMissingReferenceError, isReferencedError } from "@/utils/dbErrors.ts";
import type { Session, SessionInput, Weekday } from "@/types/session.ts";

const WEEKDAYS: readonly Weekday[] = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function assertValidId(id: number): void {
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError("Invalid session ID");
    }
}

function assertValidInput(input: unknown): asserts input is SessionInput {
    const data = input as Partial<SessionInput> | null | undefined;

    if (!data?.day || !WEEKDAYS.includes(data.day)) {
        throw new ValidationError(`day must be one of: ${WEEKDAYS.join(", ")}`);
    }
    if (!data.startTime || !TIME_PATTERN.test(data.startTime)) {
        throw new ValidationError("startTime must be a valid time (HH:MM or HH:MM:SS)");
    }
    if (!data.endTime || !TIME_PATTERN.test(data.endTime)) {
        throw new ValidationError("endTime must be a valid time (HH:MM or HH:MM:SS)");
    }
    if (data.startTime >= data.endTime) {
        throw new ValidationError("startTime must be before endTime");
    }
    if (!Number.isInteger(data.classId) || (data.classId as number) < 1) {
        throw new ValidationError("A valid classId is required");
    }
}

async function onMissingClass<T>(run: () => Promise<T>): Promise<T> {
    try {
        return await run();
    } catch (err) {
        if (isMissingReferenceError(err)) {
            throw new ValidationError("The referenced class does not exist");
        }
        throw err;
    }
}

export async function getSessionById(id: number): Promise<Session> {
    assertValidId(id);

    const found = await sessionRepository.getSessionById(id);
    if (!found) throw new NotFoundError("Session not found");

    return found;
}

export async function getSessions(query: Record<string, unknown>): Promise<Session[]> {
    if (query.classId !== undefined) {
        const classId = Number(query.classId);
        if (!Number.isInteger(classId) || classId < 1) {
            throw new ValidationError("Invalid classId");
        }
        return sessionRepository.getSessionsByClass(classId);
    }

    return sessionRepository.getAllSessions();
}

export async function createSession(input: unknown): Promise<Session> {
    assertValidInput(input);

    return onMissingClass(() => sessionRepository.createSession(input));
}

export async function updateSession(id: number, input: unknown): Promise<Session> {
    assertValidId(id);
    assertValidInput(input);

    const updated = await onMissingClass(() =>
        sessionRepository.updateSession(id, input),
    );

    if (!updated) throw new NotFoundError("Session not found");

    return updated;
}

export async function deleteSession(id: number): Promise<void> {
    assertValidId(id);

    try {
        const deleted = await sessionRepository.deleteSession(id);
        if (!deleted) throw new NotFoundError("Session not found");
    } catch (err) {
        if (isReferencedError(err)) {
            throw new ConflictError(
                "Session has attendance records and cannot be deleted",
            );
        }
        throw err;
    }
}

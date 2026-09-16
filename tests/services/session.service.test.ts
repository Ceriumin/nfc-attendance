import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("@/repository/session.repository.ts");

import * as sessionService from "../../src/services/session.service.ts";
import * as sessionRepository from "../../src/repository/session.repository.ts";
import { ValidationError, NotFoundError, ConflictError } from "../../src/utils/AppError.ts";
import type { Session, SessionInput } from "../../src/types/session.ts";

const fakeSession: Session = {
    id: 1,
    day: "monday",
    start_time: "09:00:00",
    end_time: "10:00:00",
    class_id: 1,
};

const validInput: SessionInput = {
    day: "monday",
    startTime: "09:00",
    endTime: "10:00",
    classId: 1,
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getSessionById", () => {
    test("rejects a non-positive id before hitting the database", async () => {
        await expect(sessionService.getSessionById(0)).rejects.toThrow(ValidationError);
        expect(sessionRepository.getSessionById).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when the repository returns null", async () => {
        vi.mocked(sessionRepository.getSessionById).mockResolvedValue(null);
        await expect(sessionService.getSessionById(999)).rejects.toThrow(NotFoundError);
    });

    test("returns the session when it exists", async () => {
        vi.mocked(sessionRepository.getSessionById).mockResolvedValue(fakeSession);
        await expect(sessionService.getSessionById(1)).resolves.toEqual(fakeSession);
    });
});

describe("getSessions", () => {
    test("with no query returns all sessions", async () => {
        vi.mocked(sessionRepository.getAllSessions).mockResolvedValue([fakeSession]);
        await expect(sessionService.getSessions({})).resolves.toEqual([fakeSession]);
        expect(sessionRepository.getAllSessions).toHaveBeenCalled();
    });

    test("with a classId filters by class", async () => {
        vi.mocked(sessionRepository.getSessionsByClass).mockResolvedValue([fakeSession]);
        await sessionService.getSessions({ classId: "2" });
        expect(sessionRepository.getSessionsByClass).toHaveBeenCalledWith(2);
    });

    test("rejects an invalid classId", async () => {
        await expect(sessionService.getSessions({ classId: "abc" })).rejects.toThrow(ValidationError);
    });
});

describe("createSession", () => {
    test("rejects an invalid weekday", async () => {
        await expect(
            sessionService.createSession({ ...validInput, day: "someday" }),
        ).rejects.toThrow(ValidationError);
        expect(sessionRepository.createSession).not.toHaveBeenCalled();
    });

    test("rejects a malformed time", async () => {
        await expect(
            sessionService.createSession({ ...validInput, startTime: "9am" }),
        ).rejects.toThrow(ValidationError);
    });

    test("rejects when startTime is not before endTime", async () => {
        await expect(
            sessionService.createSession({ ...validInput, startTime: "10:00", endTime: "09:00" }),
        ).rejects.toThrow(ValidationError);
    });

    test("rejects a missing classId", async () => {
        await expect(
            sessionService.createSession({ day: "monday", startTime: "09:00", endTime: "10:00" }),
        ).rejects.toThrow(ValidationError);
    });

    test("saves valid input and returns the created session", async () => {
        vi.mocked(sessionRepository.createSession).mockResolvedValue(fakeSession);
        const result = await sessionService.createSession(validInput);
        expect(result).toEqual(fakeSession);
        expect(sessionRepository.createSession).toHaveBeenCalledWith(validInput);
    });

    test("translates a missing-reference DB error into a ValidationError", async () => {
        vi.mocked(sessionRepository.createSession).mockRejectedValue({ code: "ER_NO_REFERENCED_ROW_2" });
        await expect(sessionService.createSession(validInput)).rejects.toThrow(ValidationError);
    });
});

describe("updateSession", () => {
    test("throws NotFoundError when the repository returns null", async () => {
        vi.mocked(sessionRepository.updateSession).mockResolvedValue(null);
        await expect(sessionService.updateSession(999, validInput)).rejects.toThrow(NotFoundError);
    });

    test("returns the updated session on success", async () => {
        vi.mocked(sessionRepository.updateSession).mockResolvedValue(fakeSession);
        const result = await sessionService.updateSession(1, validInput);
        expect(result).toEqual(fakeSession);
        expect(sessionRepository.updateSession).toHaveBeenCalledWith(1, validInput);
    });
});

describe("deleteSession", () => {
    test("throws NotFoundError when nothing was deleted", async () => {
        vi.mocked(sessionRepository.deleteSession).mockResolvedValue(false);
        await expect(sessionService.deleteSession(999)).rejects.toThrow(NotFoundError);
    });

    test("translates a referenced-row DB error into a ConflictError", async () => {
        vi.mocked(sessionRepository.deleteSession).mockRejectedValue({ code: "ER_ROW_IS_REFERENCED_2" });
        await expect(sessionService.deleteSession(1)).rejects.toThrow(ConflictError);
    });

    test("resolves when a session is deleted", async () => {
        vi.mocked(sessionRepository.deleteSession).mockResolvedValue(true);
        await expect(sessionService.deleteSession(1)).resolves.toBeUndefined();
    });
});

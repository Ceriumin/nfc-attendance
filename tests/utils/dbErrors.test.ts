import { describe, test, expect } from 'vitest'
import { isDuplicateKeyError } from "../../src/utils/dbErrors";

describe("isDuplicateKeyError", () => {

    test("returns true for a mysql2 duplicate-entry error", () => {
        expect(isDuplicateKeyError({ code: "ER_DUP_ENTRY", errno: 1062 })).toBe(true);
    });

    test("returns false for a different database error code", () => {
        expect(isDuplicateKeyError({ code: "ER_NO_SUCH_TABLE" })).toBe(false);
    });

    test("returns false for a plain Error", () => {
        expect(isDuplicateKeyError(new Error("boom"))).toBe(false);
    });

    test("returns false for an object with no code", () => {
        expect(isDuplicateKeyError({})).toBe(false);
    });

    test("returns false for a non-object value", () => {
        expect(isDuplicateKeyError("ER_DUP_ENTRY")).toBe(false);
    });

    test("returns false for null (guards the typeof-null-is-object trap)", () => {
        expect(isDuplicateKeyError(null)).toBe(false);
    });

    test("returns false for undefined", () => {
        expect(isDuplicateKeyError(undefined)).toBe(false);
    });
});

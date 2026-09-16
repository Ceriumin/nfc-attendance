import { describe, test, expect } from 'vitest'
import { hashPassword, verifyPassword } from "../../src/utils/password";

describe("password", () => {
    /* ————————— Core correctness ————————— */

    test("a correct password verifies against its hash", async () => {
        const hash = await hashPassword("hunter2");
        expect(await verifyPassword("hunter2", hash)).toBe(true);
    });

    test("a wrong password does not verify", async () => {
        const hash = await hashPassword("hunter2");
        expect(await verifyPassword("wrong-password", hash)).toBe(false);
    });

    test("the hash is not the plaintext", async () => {
        const hash = await hashPassword("hunter2");
        expect(hash).not.toBe("hunter2");
    });

    /* ————————— Salt behaviour ————————— */

    test("hashing the same password twice produces different hashes", async () => {
        const first = await hashPassword("hunter2");
        const second = await hashPassword("hunter2");
        expect(first).not.toBe(second);
    });

    test("both independently-salted hashes still verify the same password", async () => {
        const first = await hashPassword("hunter2");
        const second = await hashPassword("hunter2");
        expect(await verifyPassword("hunter2", first)).toBe(true);
        expect(await verifyPassword("hunter2", second)).toBe(true);
    });

    /* ————————— Input edge cases ————————— */

    test("verification is case sensitive", async () => {
        const hash = await hashPassword("hunter2");
        expect(await verifyPassword("Hunter2", hash)).toBe(false);
    });

    test("leading/trailing whitespace is significant", async () => {
        const hash = await hashPassword("hunter2");
        expect(await verifyPassword("hunter2 ", hash)).toBe(false);
        expect(await verifyPassword(" hunter2", hash)).toBe(false);
    });

    test("an empty password round-trips against its own hash", async () => {
        const hash = await hashPassword("");
        expect(await verifyPassword("", hash)).toBe(true);
    });

    test("an empty attempt does not verify against a real password", async () => {
        const hash = await hashPassword("hunter2");
        expect(await verifyPassword("", hash)).toBe(false);
    });

    test("unicode and emoji passwords round-trip correctly", async () => {
        const hash = await hashPassword("pÄsswörd🔑");
        expect(await verifyPassword("pÄsswörd🔑", hash)).toBe(true);
        expect(await verifyPassword("pAsswOrd", hash)).toBe(false);
    });
});

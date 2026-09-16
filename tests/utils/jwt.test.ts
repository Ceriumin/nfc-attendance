import { describe, test, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import { env } from "../../src/config/env";
import { signToken, verifyToken } from "../../src/utils/jwt";
import type { JwtPayload } from "../../src/types/jwt";

const payload: JwtPayload = {
    id: 1,
    role: "admin",
    email: "johndoe@email.com",
    studentId: 42,
};

describe("jwt", () => {
    /* ————————— Round trip ————————— */

    test("a signed token verifies and round-trips its payload", () => {
        const token = signToken(payload);
        const decoded = verifyToken(token);

        expect(decoded.id).toBe(1);
        expect(decoded.role).toBe("admin");
        expect(decoded.email).toBe("johndoe@email.com");
        expect(decoded.studentId).toBe(42);
    });

    test("signing produces a three-part dot-separated string", () => {
        const token = signToken(payload);
        expect(token.split(".")).toHaveLength(3);
    });

    /* ————————— Tamper / forgery resistance ————————— */

    test("a token signed with a different secret is rejected", () => {
        const forged = jwt.sign(payload, "a-different-secret");
        expect(() => verifyToken(forged)).toThrow();
    });

    test("a tampered payload is rejected", () => {
        const token = signToken(payload);
        const [header, body, signature] = token.split(".");
        // flip a character in the payload segment
        const mutatedBody = body.slice(0, -1) + (body.at(-1) === "A" ? "B" : "A");
        const tampered = `${header}.${mutatedBody}.${signature}`;
        expect(() => verifyToken(tampered)).toThrow();
    });

    test("garbage input is rejected", () => {
        expect(() => verifyToken("not-a-real-token")).toThrow();
    });

    /* ————————— Expiry ————————— */

    test("an expired token is rejected", () => {
        const expired = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "-1s" });
        expect(() => verifyToken(expired)).toThrow();
    });
});

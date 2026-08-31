import { describe, test, expect } from 'vitest'
import isOnTime from "../../src/utils/checkAttendance";

describe('checkAttendance', () => {
    test("check that the student is present", () => {
        const startTime = '08:00:00';
        const tappedTime = '08:00:00';

        expect(isOnTime(startTime, tappedTime)).toBe(true);
    })

    test("check that the student is late", () => {
        const startTime = '08:00:00';
        const tappedTime = '08:30:00';

        expect(isOnTime(startTime, tappedTime)).toBe(false);
    })

    test("throws on a garbage time string", () => {
        expect(() => isOnTime('08:00:00', 'not-a-time')).toThrow();
    })

    test("throws when the seconds field is missing", () => {
        expect(() => isOnTime('08:00:00', '08:30')).toThrow();
    })

    test("throws with a helpful message naming the bad value", () => {
        expect(() => isOnTime('08:00:00', 'bad')).toThrow(/Invalid time format/);
    })
})

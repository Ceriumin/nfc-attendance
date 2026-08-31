import { describe, test, expect } from 'vitest'
import { checkWeekday} from "../../src/utils/checkWeekday";

describe("checkWeekday", () => {
    test("maps a normal weekday index to its name", () => {
        const monday = 1;
        const result = checkWeekday(monday);
        expect(result).toBe("Monday");
    });

    test("maps 0 to Sunday (lower bound)", () => {
        expect(checkWeekday(0)).toBe("Sunday");
    })

    test("maps 7 to Saturday (upper bound)", () => {
        expect(checkWeekday(6)).toBe("Saturday");
    })

    test("returns an empty string for an invalid index", () => {
        expect(checkWeekday(9)).toBe("");
    })
})


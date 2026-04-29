import { describe, it, expect } from "vitest";
import { formatDate, formatDateShort } from "../../src/utils/date-utils";

describe("date-utils", () => {
	it("formatDate returns YYYY-MM-DD format", () => {
		const date = new Date("2024-01-15");
		expect(formatDate(date)).toBe("2024-01-15");
	});

	it("formatDateShort returns fewer chars than formatDate", () => {
		const date = new Date("2024-01-15");
		expect(formatDateShort(date).length).toBeLessThanOrEqual(formatDate(date).length);
	});
});

import { describe, it, expect } from "vitest";
import { url, pathsEqual } from "../../src/utils/url-utils";

describe("url-utils", () => {
	it("url() prepends base path", () => {
		const result = url("/test");
		expect(result).toBe("/test");
	});

	it("url() removes trailing slash", () => {
		const result = url("/test/");
		expect(result).toBe("/test");
	});

	it("pathsEqual matches identical paths", () => {
		expect(pathsEqual("/about", "/about")).toBe(true);
	});

	it("pathsEqual does not match different paths", () => {
		expect(pathsEqual("/about", "/posts/hello")).toBe(false);
	});
});

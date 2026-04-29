import { describe, it, expect } from "vitest";
import { getUniqueTags, getUniqueCategories, getSortedPosts } from "../../src/utils/content-utils";
import type { CollectionEntry } from "astro:content";

// The content-utils functions require Astro content collection types,
// so we test with minimal mock data when possible.
// Full integration tests would need a running Astro build.

describe("content-utils", () => {
	it("getSortedPosts returns empty array for empty input", () => {
		const posts: CollectionEntry<"posts">[] = [];
		const result = getSortedPosts(posts);
		expect(result).toEqual([]);
	});

	it("getUniqueTags returns empty array for empty posts", () => {
		const posts: CollectionEntry<"posts">[] = [];
		const result = getUniqueTags(posts);
		expect(result).toEqual([]);
	});

	it("getUniqueCategories returns empty array for empty posts", () => {
		const posts: CollectionEntry<"posts">[] = [];
		const result = getUniqueCategories(posts);
		expect(result).toEqual([]);
	});
});

// Editor utility functions
import type { LoginData, Metadata } from "./types";
import { LOGIN_STORAGE_KEY } from "./editor-state";

export function parseTags(tags: Metadata["tags"] | undefined): string[] {
	if (!tags) return [];
	if (Array.isArray(tags)) {
		return tags.map((tag) => tag.trim()).filter(Boolean);
	}
	return tags
		.split(",")
		.map((tag) => tag.trim())
		.filter(Boolean);
}

export function parseDateValue(value: unknown): number {
	if (!value) return 0;
	const date = value instanceof Date ? value : new Date(String(value));
	const time = date.getTime();
	return Number.isNaN(time) ? 0 : time;
}

export function formatDateLabel(value: unknown): string {
	if (!value) return "未设置日期";
	const date = value instanceof Date ? value : new Date(String(value));
	if (Number.isNaN(date.getTime())) return "未设置日期";
	return date.toISOString().split("T")[0];
}

export function loadCustomList(key: string): string[] {
	const raw = localStorage.getItem(key);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.map((item) => String(item).trim()).filter(Boolean);
	} catch {
		localStorage.removeItem(key);
		return [];
	}
}

export function saveCustomList(key: string, list: string[]) {
	localStorage.setItem(key, JSON.stringify(list));
}

export function uniqueSorted(values: string[]): string[] {
	return Array.from(
		new Set(values.map((value) => value.trim()).filter(Boolean)),
	).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

export function normalizeSlug(slug: string): string {
	return slug.replace(/^\/+/, "").replace(/\.md$/i, "").trim();
}

export function pathToSlug(path: string): string {
	const normalizedPath = path.replace(/^src\/content\/posts\//, "");
	return normalizeSlug(
		normalizedPath.replace(/\/index\.md$/i, "").replace(/\.md$/i, ""),
	);
}

export function getHashSlug(): string | null {
	const hash = window.location.hash;
	if (!hash) return null;
	return normalizeSlug(hash.replace(/^#/, ""));
}

export function getQuerySlug(): string | null {
	const params = new URLSearchParams(window.location.search);
	const file = params.get("file");
	if (!file) return null;
	return normalizeSlug(file);
}

export function getSlugFromUrl(): string | null {
	return getHashSlug() || getQuerySlug();
}

export function setEditorHashByPath(path: string | null, replace = false) {
	if (!path) return;
	const slug = pathToSlug(path);
	if (replace) {
		window.history.replaceState(null, "", `#${slug}`);
	} else {
		window.location.hash = slug;
	}
}

export function parseSavedLoginData(): LoginData | null {
	const savedData = localStorage.getItem(LOGIN_STORAGE_KEY);
	if (!savedData) return null;
	try {
		const parsed = JSON.parse(savedData) as Partial<LoginData>;
		if (!parsed.user || !parsed.repo || !parsed.pat) {
			localStorage.removeItem(LOGIN_STORAGE_KEY);
			return null;
		}
		return {
			user: String(parsed.user).trim(),
			repo: String(parsed.repo).trim(),
			pat: String(parsed.pat).trim(),
		};
	} catch {
		localStorage.removeItem(LOGIN_STORAGE_KEY);
		return null;
	}
}

export function applyLoginData(loginData: LoginData) {
	localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(loginData));
}

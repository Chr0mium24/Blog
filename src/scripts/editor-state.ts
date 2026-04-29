// Editor shared state, constants, and types
import type { EditorState } from "./types";

// --- Editor state ---
export const state: EditorState = {
	user: "",
	repo: "",
	pat: "",
	currentFile: { path: null, sha: null, isNew: false },
};

// --- Crepe editor instance ---
export let crepeInstance: import("@milkdown/crepe").Crepe | null = null;
export let crepeReady: Promise<void> | null = null;
export let suppressCrepeDirty = false;

// --- Dirty/draft state ---
export let draftInterval: number | null = null;
export let isDirty = false;
export let pendingSlug: string | null = null;
export let cachedEntries: FileEntry[] = [];
export let sourceSnapshot = "";

// --- Constants ---
export const CUSTOM_TAGS_KEY = "github_editor_custom_tags";
export const CUSTOM_CATEGORIES_KEY = "github_editor_custom_categories";
export const LOGIN_STORAGE_KEY = "github_editor_data";
export const UNSAVED_NEW_FILE_DRAFT_KEY = "github_editor_unsaved_new_file_draft";

// --- Types ---
export type FileEntry = {
	path: string;
	name: string;
	sha: string;
	title: string;
	dateLabel: string;
	sortTime: number;
	tags: string[];
	category: string;
};

export type UnsavedNewFileDraft = {
	user: string;
	repo: string;
	path: string;
	metadata: Partial<import("./types").Metadata>;
	body: string;
	savedAt: string;
};

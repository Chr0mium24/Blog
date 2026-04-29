import type { EditorState, LoginData } from "./types";
import { getFiles } from "./utils";

const STORAGE_KEY = "github_editor_data";
const DEFAULT_NEXT = "/editor/?mode=post";

const ui = {
	loginBtn: document.getElementById("login-btn") as HTMLButtonElement,
	loginSpinner: document.getElementById("login-spinner") as HTMLElement,
	userInput: document.getElementById("github-user") as HTMLInputElement,
	repoInput: document.getElementById("github-repo") as HTMLInputElement,
	patInput: document.getElementById("github-pat") as HTMLInputElement,
	loginError: document.getElementById("login-error") as HTMLElement,
};

function showLoginError(message: string) {
	ui.loginError.textContent = message;
	ui.loginError.classList.remove("hidden");
}

function hideLoginError() {
	ui.loginError.textContent = "";
	ui.loginError.classList.add("hidden");
}

function setLoading(loading: boolean) {
	ui.loginSpinner.classList.toggle("hidden", !loading);
	ui.loginBtn.classList.toggle("btn-disabled", loading);
}

function getNextPath() {
	const params = new URLSearchParams(window.location.search);
	const next = params.get("next")?.trim();
	if (!next || !next.startsWith("/")) return DEFAULT_NEXT;
	return next;
}

function buildState(loginData: LoginData): EditorState {
	return {
		user: loginData.user,
		repo: loginData.repo,
		pat: loginData.pat,
		currentFile: { path: null, sha: null, isNew: false },
	};
}

function notifyAuthChanged() {
	window.dispatchEvent(
		new CustomEvent("github-editor-auth-changed", {
			detail: { storageKey: STORAGE_KEY },
		}),
	);
}

function loadSavedLoginData(): LoginData | null {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as Partial<LoginData>;
		if (!parsed.user || !parsed.repo || !parsed.pat) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return {
			user: String(parsed.user).trim(),
			repo: String(parsed.repo).trim(),
			pat: String(parsed.pat).trim(),
		};
	} catch {
		localStorage.removeItem(STORAGE_KEY);
		return null;
	}
}

function prefillSavedData() {
	const saved = loadSavedLoginData();
	if (!saved) return;
	ui.userInput.value = saved.user;
	ui.repoInput.value = saved.repo;
	ui.patInput.value = saved.pat;
}

function redirectIfAlreadyLoggedIn() {
	const saved = loadSavedLoginData();
	if (!saved) return;
	window.location.replace(getNextPath());
}

async function login() {
	hideLoginError();
	setLoading(true);

	const loginData: LoginData = {
		user: ui.userInput.value.trim(),
		repo: ui.repoInput.value.trim(),
		pat: ui.patInput.value.trim(),
	};

	if (!loginData.user || !loginData.repo || !loginData.pat) {
		showLoginError("所有字段均为必填项。");
		setLoading(false);
		return;
	}

	try {
		await getFiles(buildState(loginData));
		localStorage.setItem(STORAGE_KEY, JSON.stringify(loginData));
		notifyAuthChanged();
		window.location.href = getNextPath();
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "登录失败，请检查账号、仓库和 PAT。";
		showLoginError(`登录失败: ${message}`);
		setLoading(false);
	}
}

export function initializeLoginApp(): void {
	redirectIfAlreadyLoggedIn();
	prefillSavedData();

	ui.loginBtn.addEventListener("click", login);

	[ui.userInput, ui.repoInput, ui.patInput].forEach((input) => {
		input.addEventListener("keydown", (event) => {
			if (event.key !== "Enter") return;
			event.preventDefault();
			login();
		});
	});
}

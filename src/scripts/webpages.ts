import type { EditorState, LoginData } from "./types";
import { deleteFile } from "./utils";

const STORAGE_KEY = "github_editor_data";

function parseLoginData(): LoginData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LoginData>;
    if (!parsed.user || !parsed.repo || !parsed.pat) return null;
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

function toState(login: LoginData): EditorState {
  return {
    user: login.user,
    repo: login.repo,
    pat: login.pat,
    currentFile: { path: null, sha: null, isNew: false },
  };
}

function toggleAuthActions() {
  const loginData = parseLoginData();
  const loggedIn = !!loginData;
  document
    .querySelectorAll("[data-public-auth-actions]")
    .forEach((el) => el.classList.toggle("hidden", !loggedIn));
  const newBtn = document.querySelector("[data-public-new-btn]");
  const loginBtn = document.querySelector("[data-public-login-btn]");
  newBtn?.classList.toggle("hidden", !loggedIn);
  loginBtn?.classList.toggle("hidden", loggedIn);
}

async function handleDelete(filename: string) {
  const loginData = parseLoginData();
  if (!loginData) {
    window.location.href = `/editor/?mode=html`;
    return;
  }
  const yes = confirm(`确定删除 ${filename} 吗？`);
  if (!yes) return;

  const state = toState(loginData);
  const fullPath = `public/${filename}`;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${state.user}/${state.repo}/contents/${fullPath}`,
      {
        headers: {
          Authorization: `token ${state.pat}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!response.ok) throw new Error("读取文件 SHA 失败。");
    const payload = await response.json();
    await deleteFile(state, fullPath, payload.sha);
    window.location.reload();
  } catch (error) {
    const message = error instanceof Error ? error.message : "删除失败。";
    alert(message);
  }
}

export function initializeWebPages(): void {
  toggleAuthActions();
  window.addEventListener("storage", (event) => {
    if (event.key && event.key !== STORAGE_KEY) return;
    toggleAuthActions();
  });
  window.addEventListener("github-editor-auth-changed", toggleAuthActions);

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const deleteBtn = target.closest("[data-public-delete-file]");
    if (!deleteBtn) return;
    const filename = deleteBtn.getAttribute("data-public-delete-file");
    if (!filename) return;
    void handleDelete(filename);
  });
}

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/nord.css";
import { Crepe } from "@milkdown/crepe";
import { replaceAll } from "@milkdown/utils";
import type { EditorState, LoginData, Metadata } from "./types";
import {
  createFullMarkdown,
  getFiles,
  getFileContent,
  parseContent,
  updateFile,
} from "./utils";

type InlineState = {
  filePath: string | null;
  sha: string | null;
  metadata: Partial<Metadata>;
  loaded: boolean;
  loading: boolean;
};

const STORAGE_KEY = "github_editor_data";
const YAML_SRC =
  "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js";

const inlineState: InlineState = {
  filePath: null,
  sha: null,
  metadata: {},
  loaded: false,
  loading: false,
};

let yamlPromise: Promise<void> | null = null;
let inlineEditor: Crepe | null = null;
let inlineEditorReady: Promise<void> | null = null;

const getWindow = () =>
  window as typeof window & { __postMetaEditorInit?: boolean; jsyaml?: unknown };

const ensureYaml = () => {
  const win = getWindow();
  if (win.jsyaml) return Promise.resolve();
  if (yamlPromise) return yamlPromise;
  yamlPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = YAML_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("加载 YAML 解析器失败，请检查网络。"));
    document.head.appendChild(script);
  });
  return yamlPromise;
};

const parseLoginData = (): LoginData | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const notifyAuthChanged = () => {
  window.dispatchEvent(
    new CustomEvent("github-editor-auth-changed", {
      detail: { storageKey: STORAGE_KEY },
    })
  );
};

const createState = (login: LoginData): EditorState => ({
  user: login.user,
  repo: login.repo,
  pat: login.pat,
  currentFile: { path: null, sha: null, isNew: false },
});

const resolveContainerFromModal = (modalEl: HTMLElement) => {
  const direct = modalEl.closest("[data-editor-meta]");
  if (direct) return direct;
  const slug = modalEl.getAttribute("data-editor-modal-id")?.trim() ?? "";
  if (!slug) return null;
  const selector = `[data-editor-meta][data-editor-slug="${CSS.escape(slug)}"]`;
  return document.querySelector(selector);
};

const ensureInlineEditor = async () => {
  if (inlineEditor && inlineEditorReady) return inlineEditorReady;
  const root = document.querySelector("[data-editor-body]") as HTMLElement | null;
  if (!root) return;
  inlineEditor = new Crepe({ root });
  inlineEditorReady = inlineEditor.create().then(() => undefined);
  return inlineEditorReady;
};

const getSlug = () => {
  const container = document.querySelector("[data-editor-meta][data-editor-slug]");
  const slug = container?.getAttribute("data-editor-slug");
  return slug ? slug.trim() : null;
};

const normalizeSlug = (slug: string) =>
  slug.replace(/^\/+/, "").replace(/\.md$/i, "");

const getCandidatePaths = (slug: string) => {
  const normalized = normalizeSlug(slug);
  return [
    `src/content/posts/${normalized}.md`,
    `src/content/posts/${normalized}/index.md`,
  ];
};

const getFieldInput = (name: string) =>
  document.querySelector(`[data-editor-field="${name}"]`) as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;

const getFieldValue = (name: string) => {
  const input = getFieldInput(name);
  return input ? input.value : null;
};

const setFieldValue = (name: string, value: string) => {
  const input = getFieldInput(name);
  if (input) input.value = value;
};

const getBodyRoot = () =>
  document.querySelector("[data-editor-body]") as HTMLElement | null;

const getStatusEl = () =>
  document.querySelector("[data-editor-status]") as HTMLElement | null;

const setStatus = (message: string, isError: boolean = false) => {
  const statusEl = getStatusEl();
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove("text-75", "text-red-500", "text-green-600");
  statusEl.classList.add(isError ? "text-red-500" : "text-green-600");
};

const formatDateInputValue = (value: unknown) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const hydrateFieldsFromMetadata = (metadata: Partial<Metadata>) => {
  setFieldValue("title", "");
  setFieldValue("category", "");
  setFieldValue("tags", "");
  setFieldValue("published", "");
  setFieldValue("updated", "");

  if (metadata.title) {
    setFieldValue("title", String(metadata.title));
  }
  if (metadata.category) {
    setFieldValue("category", String(metadata.category));
  }
  if (metadata.tags) {
    const tagsValue = Array.isArray(metadata.tags)
      ? metadata.tags.join(", ")
      : String(metadata.tags);
    setFieldValue("tags", tagsValue);
  }
  if (metadata.published) {
    setFieldValue("published", formatDateInputValue(metadata.published));
  }
  if (metadata.updated) {
    setFieldValue("updated", formatDateInputValue(metadata.updated));
  }
};

const loadPostContent = async () => {
  if (inlineState.loaded) {
    setStatus("正文已加载，可以直接编辑。", false);
    return;
  }
  if (inlineState.loading) return;
  const loginData = parseLoginData();
  if (!loginData) {
    setStatus("请先登录后再加载正文。", true);
    return;
  }
  const slug = getSlug();
  if (!slug) {
    setStatus("未找到文章标识，无法加载正文。", true);
    return;
  }

  inlineState.loading = true;
  setStatus("正在加载正文...", false);

  try {
    await ensureYaml();
    await ensureInlineEditor();
    if (!inlineEditor) {
      setStatus("正文编辑器初始化失败。", true);
      return;
    }
    const state = createState(loginData);
    let lastError: unknown = null;
    let content = "";
    let path = "";
    let sha = "";

    for (const candidate of getCandidatePaths(slug)) {
      try {
        const result = await getFileContent(state, candidate);
        content = result.content;
        sha = result.sha;
        path = candidate;
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!path) {
      throw lastError || new Error("未找到文章文件。");
    }

    const parsed = parseContent(content);
    inlineState.filePath = path;
    inlineState.sha = sha;
    inlineState.metadata = parsed.metadata || {};
    inlineState.loaded = true;
    inlineEditor.editor.action(replaceAll(parsed.body || ""));
    hydrateFieldsFromMetadata(inlineState.metadata);
    setStatus("正文已加载，可以开始编辑。", false);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "正文加载失败。";
    setStatus(message, true);
  } finally {
    inlineState.loading = false;
  }
};

const savePostContent = async () => {
  const loginData = parseLoginData();
  if (!loginData) {
    setStatus("请先登录后再保存。", true);
    return;
  }
  if (!inlineState.loaded || !inlineState.filePath || !inlineState.sha) {
    setStatus("正文尚未加载，无法保存。", true);
    return;
  }
  await ensureInlineEditor();
  if (!inlineEditor) {
    setStatus("正文编辑器初始化失败。", true);
    return;
  }

  setStatus("正在保存...", false);

  try {
    await ensureYaml();
    const state = createState(loginData);
    const nextMetadata: Partial<Metadata> = { ...inlineState.metadata };
    const titleValue = getFieldValue("title");
    const publishedValue = getFieldValue("published");
    const updatedValue = getFieldValue("updated");
    const categoryValue = getFieldValue("category");
    const tagsValue = getFieldValue("tags");

    if (titleValue !== null) nextMetadata.title = titleValue.trim();
    if (publishedValue !== null) nextMetadata.published = publishedValue.trim();
    if (updatedValue !== null) nextMetadata.updated = updatedValue.trim();
    if (categoryValue !== null) nextMetadata.category = categoryValue.trim();
    if (tagsValue !== null) nextMetadata.tags = tagsValue.trim();
    const nextContent = createFullMarkdown(
      nextMetadata,
      inlineEditor.getMarkdown()
    );
    const result = await updateFile(
      state,
      inlineState.filePath,
      nextContent,
      inlineState.sha
    );
    inlineState.sha = result.content.sha;
    inlineState.metadata = nextMetadata;
    setStatus("保存成功，刷新页面查看效果。", false);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "保存失败。";
    setStatus(message, true);
  }
};

const updateToggleState = (toggleStateEl: Element | null, isOpen: boolean) => {
  if (!toggleStateEl) return;
  toggleStateEl.textContent = isOpen ? "开启" : "关闭";
};

const updateSummary = (summaryEl: Element | null, loginData: LoginData | null) => {
  if (!summaryEl) return;
  if (loginData?.user && loginData?.repo) {
    summaryEl.textContent = `已登录：${loginData.user}/${loginData.repo}`;
  } else {
    summaryEl.textContent = "未登录";
  }
};

const updateAuthOnlyVisibility = (loginData: LoginData | null) => {
  const isLoggedIn = !!(loginData?.user && loginData?.repo && loginData?.pat);
  document.querySelectorAll("[data-editor-auth-only]").forEach((el) => {
    el.classList.toggle("hidden", !isLoggedIn);
  });

  if (!isLoggedIn) {
    document
      .querySelectorAll("[data-editor-panel]")
      .forEach((el) => el.classList.add("hidden"));
    document
      .querySelectorAll("[data-editor-modal]")
      .forEach((el) => el.classList.add("hidden"));
  }
};

const toggleInlineFields = (isOpen: boolean) => {
  document
    .querySelectorAll("[data-editor-inline-display]")
    .forEach((el) => el.classList.toggle("hidden", isOpen));
  document
    .querySelectorAll("[data-editor-inline-input]")
    .forEach((el) => el.classList.toggle("hidden", !isOpen));
  document.documentElement.classList.toggle("editor-inline-active", isOpen);
};

const setPanelOpen = (
  panelEl: Element | null,
  toggleStateEl: Element | null,
  isOpen: boolean
) => {
  if (!panelEl) return;
  panelEl.classList.toggle("hidden", !isOpen);
  updateToggleState(toggleStateEl, isOpen);
  toggleInlineFields(isOpen);
};

const hydrateSummaries = () => {
  const loginData = parseLoginData();
  updateAuthOnlyVisibility(loginData);
  document.querySelectorAll("[data-editor-meta]").forEach((container) => {
    const summaryEl = container.querySelector("[data-editor-summary]");
    const toggleStateEl = container.querySelector("[data-editor-toggle-state]");
    updateSummary(summaryEl, loginData);
    updateToggleState(toggleStateEl, false);
  });
};

const resetInlineState = () => {
  inlineState.filePath = null;
  inlineState.sha = null;
  inlineState.metadata = {};
  inlineState.loaded = false;
  inlineState.loading = false;
  const statusEl = getStatusEl();
  if (statusEl) {
    statusEl.textContent = "";
    statusEl.classList.remove("text-red-500", "text-green-600");
    statusEl.classList.add("text-75");
  }
  if (inlineEditor) {
    inlineEditor.editor.action(replaceAll(""));
  }
};

const closeInlineEditor = () => {
  const container = document.querySelector("[data-editor-meta][data-editor-slug]");
  if (!container) return;
  const panelEl = container.querySelector("[data-editor-panel]");
  const toggleStateEl = container.querySelector("[data-editor-toggle-state]");
  setPanelOpen(panelEl, toggleStateEl, false);
};

export const initPostInlineEditor = (): void => {
  const win = getWindow();
  if (win.__postMetaEditorInit) return;
  win.__postMetaEditorInit = true;

  const init = () => {
    hydrateSummaries();

    window.addEventListener("storage", (event) => {
      if (event.key && event.key !== STORAGE_KEY) return;
      hydrateSummaries();
    });
    window.addEventListener("github-editor-auth-changed", () => {
      hydrateSummaries();
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const toggleBtn = target.closest("[data-editor-toggle]");
      if (toggleBtn) {
        const container = toggleBtn.closest("[data-editor-meta]");
        if (!container) return;
        const panelEl = container.querySelector("[data-editor-panel]");
        const toggleStateEl = container.querySelector("[data-editor-toggle-state]");
        const summaryEl = container.querySelector("[data-editor-summary]");
        const loginData = parseLoginData();

        if (!loginData) {
          const next = encodeURIComponent(
            `${window.location.pathname}${window.location.search}${window.location.hash}`
          );
          window.location.href = `/login/?next=${next}`;
          return;
        }

        const isOpen = panelEl && !panelEl.classList.contains("hidden");
        setPanelOpen(panelEl, toggleStateEl, !isOpen);
        updateSummary(summaryEl, loginData);
        return;
      }

      const loginBtn = target.closest("[data-editor-login]");
      if (loginBtn) {
        void (async () => {
          const modalEl = loginBtn.closest("[data-editor-modal]") as HTMLElement | null;
          const container = modalEl
            ? resolveContainerFromModal(modalEl)
            : loginBtn.closest("[data-editor-meta]");
          if (!container) return;
          const userInput = modalEl?.querySelector(
            "[data-editor-user]"
          ) as HTMLInputElement | null | undefined;
          const repoInput = modalEl?.querySelector(
            "[data-editor-repo]"
          ) as HTMLInputElement | null | undefined;
          const patInput = modalEl?.querySelector(
            "[data-editor-pat]"
          ) as HTMLInputElement | null | undefined;
          const errorEl = modalEl?.querySelector("[data-editor-error]");
          const summaryEl = container.querySelector("[data-editor-summary]");
          const panelEl = container.querySelector("[data-editor-panel]");
          const toggleStateEl = container.querySelector("[data-editor-toggle-state]");
          const user = userInput?.value.trim();
          const repo = repoInput?.value.trim();
          const pat = patInput?.value.trim();
          if (!user || !repo || !pat) {
            if (errorEl) {
              errorEl.textContent = "所有字段均为必填项。";
              errorEl.classList.remove("hidden");
            }
            return;
          }
          if (errorEl) errorEl.classList.add("hidden");
          const newData = { user, repo, pat };
          try {
            await getFiles(createState(newData));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            notifyAuthChanged();
            updateAuthOnlyVisibility(newData);
            updateSummary(summaryEl, newData);
            if (modalEl) modalEl.classList.add("hidden");
            setPanelOpen(panelEl, toggleStateEl, true);
          } catch (error) {
            if (errorEl) {
              errorEl.textContent =
                error instanceof Error ? `登录失败: ${error.message}` : "登录失败，请检查输入信息。";
              errorEl.classList.remove("hidden");
            }
          }
        })();
        return;
      }

      const openContentBtn = target.closest("[data-editor-open-content]");
      if (openContentBtn) {
        loadPostContent().then(() => {
          const bodyRoot = getBodyRoot();
          const focusTarget = bodyRoot?.querySelector(
            '[contenteditable="true"]'
          ) as HTMLElement | null;
          focusTarget?.focus();
        });
        return;
      }

      const saveBtn = target.closest("[data-editor-save]");
      if (saveBtn) {
        savePostContent();
        return;
      }

      const cancelEditBtn = target.closest("[data-editor-cancel-edit]");
      if (cancelEditBtn) {
        closeInlineEditor();
        return;
      }

      const cancelBtn = target.closest("[data-editor-cancel]");
      if (cancelBtn) {
        const modalEl = cancelBtn.closest("[data-editor-modal]") as HTMLElement | null;
        const container = modalEl
          ? resolveContainerFromModal(modalEl)
          : cancelBtn.closest("[data-editor-meta]");
        if (!container) return;
        const panelEl = container.querySelector("[data-editor-panel]");
        const toggleStateEl = container.querySelector("[data-editor-toggle-state]");
        if (modalEl) modalEl.classList.add("hidden");
        setPanelOpen(panelEl, toggleStateEl, false);
        return;
      }

      const logoutBtn = target.closest("[data-editor-logout]");
      if (logoutBtn) {
        const container = logoutBtn.closest("[data-editor-meta]");
        if (!container) return;
        const panelEl = container.querySelector("[data-editor-panel]");
        const toggleStateEl = container.querySelector("[data-editor-toggle-state]");
        const summaryEl = container.querySelector("[data-editor-summary]");
        localStorage.removeItem(STORAGE_KEY);
        notifyAuthChanged();
        updateAuthOnlyVisibility(null);
        updateSummary(summaryEl, null);
        setPanelOpen(panelEl, toggleStateEl, false);
        resetInlineState();
        return;
      }

      const modalEl = target.closest("[data-editor-modal]");
      if (modalEl instanceof HTMLElement && target === modalEl) {
        modalEl.classList.add("hidden");
        const container = resolveContainerFromModal(modalEl);
        if (!container) return;
        const panelEl = container.querySelector("[data-editor-panel]");
        const toggleStateEl = container.querySelector("[data-editor-toggle-state]");
        setPanelOpen(panelEl, toggleStateEl, false);
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
};

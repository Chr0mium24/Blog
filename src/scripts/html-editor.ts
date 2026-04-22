import type { CurrentFile, EditorState, LoginData } from "./types";
import {
  createFile,
  deleteFile,
  getFileContent,
  githubApiRequest,
  updateFile,
} from "./utils";

type RepoFile = {
  name: string;
  path: string;
  sha: string;
};

type CodeMirrorEditor = {
  getValue: () => string;
  setValue: (value: string) => void;
  on: (event: string, listener: () => void) => void;
  setSize: (width: string | number, height: string | number) => void;
  refresh: () => void;
};

type AiConfig = {
  endpoint: string;
  apiKey: string;
  model: string;
  prompt: string;
  models: string[];
};

const LOGIN_STORAGE_KEY = "github_editor_data";
const AI_STORAGE_KEY = "github_html_editor_ai_config";

const ui = {
  logoutBtn: document.getElementById("html-logout-btn") as HTMLButtonElement,
  newBtn: document.getElementById("html-new-btn") as HTMLButtonElement,
  fileList: document.getElementById("html-file-list") as HTMLElement,
  dropzone: document.getElementById("html-dropzone") as HTMLElement,
  filenameInput: document.getElementById("html-filename-input") as HTMLInputElement,
  editor: document.getElementById("html-editor-textarea") as HTMLTextAreaElement,
  saveBtn: document.getElementById("html-save-btn") as HTMLButtonElement,
  downloadBtn: document.getElementById("html-download-btn") as HTMLButtonElement,
  deleteBtn: document.getElementById("html-delete-btn") as HTMLButtonElement,
  status: document.getElementById("html-status") as HTMLElement,
  ai: {
    endpoint: document.getElementById("ai-endpoint") as HTMLInputElement,
    apiKey: document.getElementById("ai-apikey") as HTMLInputElement,
    model: document.getElementById("ai-model") as HTMLSelectElement,
    prompt: document.getElementById("ai-prompt") as HTMLTextAreaElement,
    refreshModelsBtn: document.getElementById("ai-refresh-models-btn") as HTMLButtonElement,
    applyBtn: document.getElementById("ai-apply-btn") as HTMLButtonElement,
    status: document.getElementById("ai-status") as HTMLElement,
  },
};

const state: EditorState = {
  user: "",
  repo: "",
  pat: "",
  currentFile: { path: null, sha: null, isNew: false },
};

let files: RepoFile[] = [];
let isDirty = false;
let codeEditor: CodeMirrorEditor | null = null;

const defaultAiConfig: AiConfig = {
  endpoint: "https://api.openai.com/v1",
  apiKey: "",
  model: "",
  prompt: "请优化这份 HTML 的可读性与语义化结构，返回完整 HTML。",
  models: [],
};

function getCodeMirrorFactory():
  | ((textarea: HTMLTextAreaElement, options: Record<string, unknown>) => CodeMirrorEditor)
  | null {
  const win = window as unknown as {
    CodeMirror?: {
      fromTextArea?: (
        textarea: HTMLTextAreaElement,
        options: Record<string, unknown>
      ) => CodeMirrorEditor;
    };
  };
  const factory = win.CodeMirror?.fromTextArea;
  return typeof factory === "function" ? factory : null;
}

function getEditorValue() {
  return codeEditor ? codeEditor.getValue() : ui.editor.value;
}

function setEditorValue(value: string) {
  if (codeEditor) {
    codeEditor.setValue(value);
    codeEditor.refresh();
    return;
  }
  ui.editor.value = value;
}

function initializeCodeEditor() {
  const factory = getCodeMirrorFactory();
  if (!factory || codeEditor) return;
  codeEditor = factory(ui.editor, {
    mode: "htmlmixed",
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
    indentUnit: 2,
    theme: document.documentElement.classList.contains("dark")
      ? "material-darker"
      : "default",
  });
  codeEditor.setSize("100%", "68vh");
  codeEditor.on("change", () => {
    markDirty();
  });
}

function setStatus(message: string, isError = false) {
  ui.status.textContent = message;
  ui.status.className = isError ? "mt-3 text-sm text-red-500" : "mt-3 text-sm text-75";
}

function setAiStatus(message: string, isError = false) {
  ui.ai.status.textContent = message;
  ui.ai.status.className = isError ? "text-xs text-red-500" : "text-xs text-75";
}

function parseLoginData(): LoginData | null {
  const raw = localStorage.getItem(LOGIN_STORAGE_KEY);
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
    localStorage.removeItem(LOGIN_STORAGE_KEY);
    return null;
  }
}

function applyLoginData(loginData: LoginData) {
  state.user = loginData.user;
  state.repo = loginData.repo;
  state.pat = loginData.pat;
}

function redirectToLogin() {
  const currentUrl = new URL(window.location.href);
  const html = currentUrl.searchParams.get("html");
  const target = new URL("/editor/", window.location.origin);
  target.searchParams.set("mode", "html");
  if (html) {
    target.searchParams.set("html", html);
  }
  window.location.replace(`${target.pathname}${target.search}`);
}

function normalizeHtmlFilename(name: string) {
  const trimmed = name.trim().toLowerCase();
  const normalized = trimmed
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
  const safe = normalized || `page-${Date.now()}`;
  return safe.endsWith(".html") ? safe : `${safe}.html`;
}

function setCurrentFile(file: CurrentFile, filename: string) {
  state.currentFile = file;
  ui.filenameInput.value = filename;
}

function buildPublicPath(filename: string) {
  return `public/${normalizeHtmlFilename(filename)}`;
}

function pathToFilename(path: string) {
  return path.replace(/^public\//, "");
}

function findFileByName(filename: string) {
  return files.find((file) => file.name === normalizeHtmlFilename(filename)) ?? null;
}

function setUrlByFilename(filename: string | null) {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("mode", "html");
  if (filename) {
    currentUrl.searchParams.set("html", filename);
  } else {
    currentUrl.searchParams.delete("html");
  }
  const next = `${currentUrl.pathname}${currentUrl.search}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) {
    window.history.pushState(null, "", next);
  }
}

function getFilenameFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("html")?.trim();
  if (fromQuery) return fromQuery;
  const raw = window.location.hash.replace(/^#/, "").trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function markDirty() {
  isDirty = true;
}

function markClean() {
  isDirty = false;
}

function renderFileList() {
  ui.fileList.innerHTML = "";
  if (files.length === 0) {
    ui.fileList.innerHTML = `<div class="text-sm text-75 p-2">public 下没有 html 文件</div>`;
    return;
  }
  files.forEach((file) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--btn-plain-bg-hover)] transition";
    button.setAttribute("data-file-path", file.path);
    button.textContent = file.name;
    if (state.currentFile.path === file.path) {
      button.classList.add("bg-[var(--btn-plain-bg-hover)]", "text-[var(--primary)]");
    }
    ui.fileList.appendChild(button);
  });
}

async function loadFiles() {
  const data = await githubApiRequest(state, "contents/public");
  files = (Array.isArray(data) ? data : [])
    .filter((item) => item.type === "file" && String(item.name).toLowerCase().endsWith(".html"))
    .map((item) => ({
      name: String(item.name),
      path: String(item.path),
      sha: String(item.sha),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
  renderFileList();
}

async function loadFile(path: string) {
  const { content, sha } = await getFileContent(state, path);
  setEditorValue(content);
  setCurrentFile({ path, sha, isNew: false }, pathToFilename(path));
  setUrlByFilename(pathToFilename(path));
  markClean();
  renderFileList();
  setStatus(`已加载 ${pathToFilename(path)}`);
}

function createNewFileTemplate(filename?: string, content = "") {
  const finalName = normalizeHtmlFilename(filename || `page-${Date.now()}.html`);
  const fullPath = buildPublicPath(finalName);
  setCurrentFile({ path: fullPath, sha: null, isNew: true }, finalName);
  setEditorValue(content);
  markDirty();
  setUrlByFilename(finalName);
  renderFileList();
  setStatus(`新建文件 ${finalName}（尚未保存到 GitHub）`);
}

async function saveCurrentFile() {
  if (!state.currentFile.path) {
    setStatus("请先新建或选择文件。", true);
    return;
  }
  const filename = normalizeHtmlFilename(ui.filenameInput.value);
  const targetPath = buildPublicPath(filename);
  const content = getEditorValue();
  const existingTarget = findFileByName(filename);

  try {
    let result: any;
    const isRename =
      !state.currentFile.isNew &&
      !!state.currentFile.sha &&
      !!state.currentFile.path &&
      targetPath !== state.currentFile.path;

    if (
      existingTarget &&
      existingTarget.path !== state.currentFile.path &&
      !confirm(`${filename} 已存在，确定覆盖这个文件吗？`)
    ) {
      setStatus("已取消保存。");
      return;
    }

    if (isRename) {
      result = existingTarget && existingTarget.path !== state.currentFile.path
        ? await updateFile(state, targetPath, content, existingTarget.sha)
        : await createFile(state, targetPath, content);
      await deleteFile(state, state.currentFile.path, state.currentFile.sha!);
    } else if (state.currentFile.isNew || !state.currentFile.sha) {
      result = existingTarget && existingTarget.path !== state.currentFile.path
        ? await updateFile(state, targetPath, content, existingTarget.sha)
        : await createFile(state, targetPath, content);
    } else {
      result = await updateFile(state, targetPath, content, state.currentFile.sha);
    }

    if (!result?.content?.sha) {
      result = await createFile(state, targetPath, content);
    }
    setCurrentFile({ path: targetPath, sha: result.content.sha, isNew: false }, filename);
    setUrlByFilename(filename);
    await loadFiles();
    markClean();
    setStatus("保存成功。");
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存失败。";
    setStatus(message, true);
  }
}

async function deleteCurrentFile() {
  if (!state.currentFile.path) {
    setStatus("当前没有文件可删除。", true);
    return;
  }
  if (state.currentFile.isNew || !state.currentFile.sha) {
    createNewFileTemplate();
    setStatus("已取消未保存新文件。");
    return;
  }
  const yes = confirm(`确认删除 ${pathToFilename(state.currentFile.path)} 吗？`);
  if (!yes) return;
  try {
    await deleteFile(state, state.currentFile.path, state.currentFile.sha);
    createNewFileTemplate();
    await loadFiles();
    setStatus("删除成功。");
  } catch (error) {
    const message = error instanceof Error ? error.message : "删除失败。";
    setStatus(message, true);
  }
}

function downloadCurrentFile() {
  const filename = normalizeHtmlFilename(ui.filenameInput.value || "untitled.html");
  const blob = new Blob([getEditorValue()], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function ensureUniqueFilename(baseName: string): string {
  const normalized = normalizeHtmlFilename(baseName);
  if (!files.some((file) => file.name === normalized)) return normalized;
  const noExt = normalized.replace(/\.html$/i, "");
  let index = 1;
  while (files.some((file) => file.name === `${noExt}-${index}.html`)) {
    index += 1;
  }
  return `${noExt}-${index}.html`;
}

async function autoCreateHtml(content: string, preferredName?: string) {
  const filename = ensureUniqueFilename(preferredName || `pasted-${Date.now()}.html`);
  createNewFileTemplate(filename, content);
  await saveCurrentFile();
}

function bindDropAndPaste() {
  let dragDepth = 0;

  const toggleDropzoneActive = (active: boolean) => {
    ui.dropzone?.classList.toggle("border-[var(--primary)]", active);
    ui.dropzone?.classList.toggle("bg-[var(--btn-plain-bg-hover)]", active);
  };

  window.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dragDepth += 1;
    toggleDropzoneActive(true);
  });
  window.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  window.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) {
      toggleDropzoneActive(false);
    }
  });
  window.addEventListener("drop", (event) => {
    event.preventDefault();
    dragDepth = 0;
    toggleDropzoneActive(false);
    const dropped = event.dataTransfer?.files?.[0];
    if (!dropped) return;
    if (!dropped.name.toLowerCase().endsWith(".html")) {
      setStatus("仅支持拖入 .html 文件。", true);
      return;
    }
    dropped
      .text()
      .then((content) => autoCreateHtml(content, dropped.name))
      .catch(() => setStatus("读取拖入文件失败。", true));
  });

  window.addEventListener("paste", (event) => {
    const target = event.target as HTMLElement | null;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable
    ) {
      return;
    }
    const html = event.clipboardData?.getData("text/html")?.trim();
    const text = (html || event.clipboardData?.getData("text/plain") || "").trim();
    if (!text) return;
    if (!/<!doctype html|<html[\s>]/i.test(text)) return;
    void autoCreateHtml(text);
  });
}

function loadAiConfig(): AiConfig {
  const raw = localStorage.getItem(AI_STORAGE_KEY);
  if (!raw) return { ...defaultAiConfig };
  try {
    const parsed = JSON.parse(raw) as Partial<AiConfig>;
    return {
      endpoint: String(parsed.endpoint || defaultAiConfig.endpoint),
      apiKey: String(parsed.apiKey || ""),
      model: String(parsed.model || ""),
      prompt: String(parsed.prompt || defaultAiConfig.prompt),
      models: Array.isArray(parsed.models) ? parsed.models.map((model) => String(model)) : [],
    };
  } catch {
    return { ...defaultAiConfig };
  }
}

function saveAiConfig(config: AiConfig) {
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(config));
}

function getAiConfigFromUi(): AiConfig {
  const existing = loadAiConfig();
  return {
    endpoint: ui.ai.endpoint.value.trim(),
    apiKey: ui.ai.apiKey.value.trim(),
    model: ui.ai.model.value.trim(),
    prompt: ui.ai.prompt.value.trim(),
    models: existing.models,
  };
}

function renderModelOptions(models: string[], selectedModel: string) {
  ui.ai.model.innerHTML = "";
  if (models.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "请先刷新模型";
    ui.ai.model.appendChild(option);
    return;
  }
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    if (model === selectedModel) option.selected = true;
    ui.ai.model.appendChild(option);
  });
  if (selectedModel && !models.includes(selectedModel)) {
    const option = document.createElement("option");
    option.value = selectedModel;
    option.textContent = `${selectedModel} (当前)`;
    option.selected = true;
    ui.ai.model.appendChild(option);
  }
}

async function refreshModels() {
  const config = getAiConfigFromUi();
  if (!config.endpoint || !config.apiKey) {
    setAiStatus("请先填写 endpoint 和 API key。", true);
    return;
  }
  try {
    setAiStatus("正在拉取模型列表...");
    const endpoint = config.endpoint.replace(/\/+$/, "");
    const response = await fetch(`${endpoint}/models`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`模型请求失败: ${response.status}`);
    }
    const payload = await response.json();
    const models = Array.isArray(payload?.data)
      ? payload.data.map((item: any) => String(item.id)).filter(Boolean).sort((a: string, b: string) => a.localeCompare(b))
      : [];
    config.models = models;
    if (!config.model && models.length > 0) config.model = models[0];
    renderModelOptions(models, config.model);
    saveAiConfig(config);
    setAiStatus(`已加载 ${models.length} 个模型。`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "拉取模型失败。";
    setAiStatus(message, true);
  }
}

function extractAssistantText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => (part && typeof part.text === "string" ? part.text : ""))
    .join("");
}

function stripCodeFence(text: string): string {
  const cleaned = text.trim();
  const match = cleaned.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1] : cleaned;
}

async function applyAi() {
  const config = getAiConfigFromUi();
  if (!config.endpoint || !config.apiKey || !config.model) {
    setAiStatus("请先完成 endpoint / key / model 配置。", true);
    return;
  }
  saveAiConfig(config);
  try {
    setAiStatus("AI 正在处理...");
    const endpoint = config.endpoint.replace(/\/+$/, "");
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "你是 HTML 编辑助手。只返回完整 HTML，不要解释。",
          },
          {
            role: "user",
            content: `${config.prompt}\n\n当前 HTML：\n${getEditorValue()}`,
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`AI 请求失败: ${response.status}`);
    }
    const payload = await response.json();
    const content = extractAssistantText(payload?.choices?.[0]?.message?.content);
    if (!content) {
      throw new Error("AI 没有返回可用内容。");
    }
    setEditorValue(stripCodeFence(content));
    markDirty();
    setAiStatus("已应用 AI 输出到编辑器。");
    setStatus("AI 内容已写入编辑器，记得保存到 GitHub。");
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 处理失败。";
    setAiStatus(message, true);
  }
}

function initializeAi() {
  const config = loadAiConfig();
  ui.ai.endpoint.value = config.endpoint;
  ui.ai.apiKey.value = config.apiKey;
  ui.ai.prompt.value = config.prompt;
  renderModelOptions(config.models, config.model);

  [ui.ai.endpoint, ui.ai.apiKey, ui.ai.prompt, ui.ai.model].forEach((input) => {
    input.addEventListener("input", () => {
      const latest = getAiConfigFromUi();
      latest.models = loadAiConfig().models;
      saveAiConfig(latest);
    });
    input.addEventListener("change", () => {
      const latest = getAiConfigFromUi();
      latest.models = loadAiConfig().models;
      saveAiConfig(latest);
    });
  });
  ui.ai.refreshModelsBtn.addEventListener("click", () => {
    void refreshModels();
  });
  ui.ai.applyBtn.addEventListener("click", () => {
    void applyAi();
  });
}

function bindEvents() {
  ui.newBtn.addEventListener("click", () => createNewFileTemplate());
  ui.saveBtn.addEventListener("click", () => {
    void saveCurrentFile();
  });
  ui.deleteBtn.addEventListener("click", () => {
    void deleteCurrentFile();
  });
  ui.downloadBtn.addEventListener("click", downloadCurrentFile);
  if (!codeEditor) {
    ui.editor.addEventListener("input", markDirty);
  }
  ui.filenameInput.addEventListener("input", markDirty);

  ui.fileList.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const fileButton = target?.closest("[data-file-path]") as HTMLElement | null;
    if (!fileButton) return;
    const path = fileButton.getAttribute("data-file-path");
    if (!path) return;
    if (isDirty) {
      const yes = confirm("当前内容未保存，仍要切换文件吗？");
      if (!yes) return;
    }
    void loadFile(path);
  });

  ui.logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(LOGIN_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("github-editor-auth-changed", {
        detail: { storageKey: LOGIN_STORAGE_KEY },
      })
    );
    redirectToLogin();
  });

  window.addEventListener("popstate", () => {
    const filename = getFilenameFromUrl();
    if (!filename) return;
    const file = files.find((item) => item.name === filename);
    if (file) void loadFile(file.path);
  });
}

export async function initializeHtmlEditor(): Promise<void> {
  const loginData = parseLoginData();
  if (!loginData) {
    redirectToLogin();
    return;
  }
  applyLoginData(loginData);
  initializeCodeEditor();
  bindEvents();
  bindDropAndPaste();
  initializeAi();

  window.addEventListener("storage", (event) => {
    if (event.key && event.key !== LOGIN_STORAGE_KEY) return;
    const latest = parseLoginData();
    if (!latest) {
      redirectToLogin();
      return;
    }
    applyLoginData(latest);
  });

  try {
    await loadFiles();
    const fromUrl = getFilenameFromUrl();
    if (fromUrl) {
      const target = files.find((file) => file.name === fromUrl);
      if (target) {
        await loadFile(target.path);
        return;
      }
    }
    if (files.length > 0) {
      await loadFile(files[0].path);
      return;
    }
    createNewFileTemplate();
  } catch (error) {
    const message = error instanceof Error ? error.message : "初始化失败。";
    setStatus(message, true);
  }
}

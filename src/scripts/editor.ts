// src/scripts/editor.ts

import type {
  EditorState,
  Metadata,
  LoginData,
  ParsedContent,
} from "./types";
import {
  getFiles,
  getFileContent,
  createFile,
  updateFile,
  deleteFile,
  parseContent,
  normalizeFilename,
  saveDraftToStorage,
  loadDraftFromStorage,
  clearDraftFromStorage,
  createFullMarkdown,
} from "./utils";


import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/nord.css";
import { Crepe } from "@milkdown/crepe";
import { replaceAll } from "@milkdown/utils";

// UI 元素引用
const ui = {
  logoutBtn: document.getElementById("logout-btn") as HTMLButtonElement,
  fileList: document.getElementById("file-list") as HTMLUListElement,
  editorSection: document.getElementById("editor-section") as HTMLElement,
  placeholderSection: document.getElementById(
    "placeholder-section"
  ) as HTMLElement,
  currentFileName: document.getElementById("current-file-name") as HTMLElement,
  saveBtn: document.getElementById("save-btn") as HTMLButtonElement,
  saveSpinner: document.getElementById("save-spinner") as HTMLElement,
  saveStatus: document.getElementById("save-status") as HTMLElement,
  viewSourceBtn: document.getElementById("view-source-btn") as HTMLButtonElement,
  testOutputBtn: document.getElementById("test-output-btn") as HTMLButtonElement,
  deleteFileBtn: document.getElementById("delete-file-btn") as HTMLButtonElement,
  newFileBtn: document.getElementById("new-file-btn") as HTMLButtonElement,
  newFileModal: document.getElementById("new-file-modal") as HTMLElement,
  newFileInput: document.getElementById("new-filename-input") as HTMLInputElement,
  newFileError: document.getElementById("new-file-error") as HTMLElement,
  createFileConfirmBtn: document.getElementById(
    "create-file-confirm-btn"
  ) as HTMLButtonElement,
  renameFileBtn: document.getElementById("rename-file-btn") as HTMLButtonElement,
  renameFileModal: document.getElementById("rename-file-modal") as HTMLElement,
  renameFileInput: document.getElementById(
    "rename-filename-input"
  ) as HTMLInputElement,
  renameFileError: document.getElementById("rename-file-error") as HTMLElement,
  renameFileConfirmBtn: document.getElementById(
    "rename-file-confirm-btn"
  ) as HTMLButtonElement,
  themeToggle: document.getElementById("theme-toggle") as HTMLButtonElement,
  newFileCancelBtn: document.getElementById("new-file-cancel-btn") as HTMLButtonElement,
  renameFileCancelBtn: document.getElementById("rename-file-cancel-btn") as HTMLButtonElement,
  sourceModal: document.getElementById("source-modal") as HTMLElement,
  sourceContent: document.getElementById("source-content") as HTMLTextAreaElement,
  sourceCopyBtn: document.getElementById("source-copy-btn") as HTMLButtonElement,
  sourceCloseBtn: document.getElementById("source-close-btn") as HTMLButtonElement,
  tagList: document.getElementById("tag-list") as HTMLElement,
  categoryList: document.getElementById("category-list") as HTMLElement,
  newTagInput: document.getElementById("new-tag-input") as HTMLInputElement,
  newCategoryInput: document.getElementById("new-category-input") as HTMLInputElement,
  addTagBtn: document.getElementById("add-tag-btn") as HTMLButtonElement,
  addCategoryBtn: document.getElementById("add-category-btn") as HTMLButtonElement,
  meta: {
    title: document.getElementById("meta-title") as HTMLInputElement,
    published: document.getElementById("meta-published") as HTMLInputElement,
    updated: document.getElementById("meta-updated") as HTMLInputElement,
    description: document.getElementById("meta-description") as HTMLTextAreaElement,
    tags: document.getElementById("meta-tags") as HTMLInputElement,
    category: document.getElementById("meta-category") as HTMLInputElement,
  },
};

const state: EditorState = {
  user: "",
  repo: "",
  pat: "",
  currentFile: { path: null, sha: null, isNew: false },
};

let crepeInstance: Crepe | null = null;
let crepeReady: Promise<void> | null = null;
let suppressCrepeDirty = false;
let draftInterval: number | null = null;
let isDirty: boolean = false;
let pendingSlug: string | null = null;
let cachedEntries: FileEntry[] = [];

const CUSTOM_TAGS_KEY = "github_editor_custom_tags";
const CUSTOM_CATEGORIES_KEY = "github_editor_custom_categories";
const LOGIN_STORAGE_KEY = "github_editor_data";
const UNSAVED_NEW_FILE_DRAFT_KEY = "github_editor_unsaved_new_file_draft";

type FileEntry = {
  path: string;
  name: string;
  sha: string;
  title: string;
  dateLabel: string;
  sortTime: number;
  tags: string[];
  category: string;
};

type UnsavedNewFileDraft = {
  user: string;
  repo: string;
  path: string;
  metadata: Partial<Metadata>;
  body: string;
  savedAt: string;
};

// --- 主题功能 ---

function applyTheme(theme: string) {
  const html = document.documentElement;
  const lightIcon = document.getElementById("theme-icon-light");
  const darkIcon = document.getElementById("theme-icon-dark");

  if (theme === "dark") {
    html.classList.add("dark");
    lightIcon?.classList.remove("hidden");
    darkIcon?.classList.add("hidden");
  } else {
    html.classList.remove("dark");
    lightIcon?.classList.add("hidden");
    darkIcon?.classList.remove("hidden");
  }
}

function handleThemeToggle() {
  const currentTheme =
    localStorage.getItem("github_editor_theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("github_editor_theme", newTheme);
  applyTheme(newTheme);
}

function loadInitialTheme() {
  const savedTheme = localStorage.getItem("github_editor_theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
  applyTheme(theme);
}

async function ensureEditorReady() {
  if (crepeInstance && crepeReady) return crepeReady;
  const root = document.getElementById("markdown-editor");
  if (!root) return;

  crepeInstance = new Crepe({ root });
  crepeReady = crepeInstance.create().then(() => {
    crepeInstance?.on((listener) =>
      listener.markdownUpdated(() => {
        if (!suppressCrepeDirty) markAsDirty();
      })
    );
  });
  return crepeReady;
}

function getEditorMarkdown(): string {
  return crepeInstance ? crepeInstance.getMarkdown() : "";
}

function setEditorMarkdown(value: string) {
  if (!crepeInstance) return;
  suppressCrepeDirty = true;
  crepeInstance.editor.action(replaceAll(value));
  suppressCrepeDirty = false;
}

function parseTags(tags: Metadata["tags"] | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseDateValue(value: unknown): number {
  if (!value) return 0;
  const date = value instanceof Date ? value : new Date(String(value));
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatDateLabel(value: unknown): string {
  if (!value) return "未设置日期";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "未设置日期";
  return date.toISOString().split("T")[0];
}

function loadCustomList(key: string): string[] {
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

function saveCustomList(key: string, list: string[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "zh-Hans-CN")
  );
}

function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+/, "").replace(/\.md$/i, "").trim();
}

function pathToSlug(path: string): string {
  const normalizedPath = path.replace(/^src\/content\/posts\//, "");
  return normalizeSlug(normalizedPath.replace(/\/index\.md$/i, "").replace(/\.md$/i, ""));
}

function getHashSlug(): string | null {
  const rawHash = window.location.hash.replace(/^#/, "").trim();
  if (!rawHash) return null;
  try {
    return normalizeSlug(decodeURIComponent(rawHash));
  } catch {
    return normalizeSlug(rawHash);
  }
}

function getQuerySlug(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");
  return slug ? normalizeSlug(slug) : null;
}

function getSlugFromUrl(): string | null {
  return getHashSlug() || getQuerySlug();
}

function setEditorHashByPath(path: string | null, replace: boolean = false) {
  const currentUrl = new URL(window.location.href);
  const nextHash = path ? `#${encodeURIComponent(pathToSlug(path))}` : "";
  currentUrl.searchParams.delete("slug");

  const nextUrl = `${currentUrl.pathname}${currentUrl.search}${nextHash}`;
  const currentRelative = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (currentRelative === nextUrl) return;
  if (replace) {
    window.history.replaceState(null, "", nextUrl);
  } else {
    window.history.pushState(null, "", nextUrl);
  }
}

async function buildFileEntries(files: any[]): Promise<FileEntry[]> {
  const mdFiles = files.filter((file) => file.name.endsWith(".md"));
  if (mdFiles.length === 0) return [];

  const entries = await Promise.all(
    mdFiles.map(async (file: any) => {
      try {
        const { content, sha } = await getFileContent(state, file.path);
        const { metadata } = parseContent(content);
        const title = metadata.title
          ? String(metadata.title)
          : file.name.replace(/\.md$/i, "");
        const updatedTime = parseDateValue(metadata.updated);
        const publishedTime = parseDateValue(metadata.published);
        const sortTime = updatedTime || publishedTime || 0;
        const dateLabel = formatDateLabel(metadata.updated || metadata.published);
        const tags = parseTags(metadata.tags);
        const category = metadata.category ? String(metadata.category) : "";

        return {
          path: file.path,
          name: file.name,
          sha,
          title,
          dateLabel,
          sortTime,
          tags,
          category,
        } as FileEntry;
      } catch {
        return {
          path: file.path,
          name: file.name,
          sha: file.sha,
          title: file.name.replace(/\.md$/i, ""),
          dateLabel: "未设置日期",
          sortTime: 0,
          tags: [],
          category: "",
        } as FileEntry;
      }
    })
  );

  return entries.sort((a, b) => b.sortTime - a.sortTime);
}

function renderTagCategoryRegistry(entries: FileEntry[]) {
  const entryTags = entries.flatMap((entry) => entry.tags);
  const entryCategories = entries
    .map((entry) => entry.category)
    .filter(Boolean);
  const customTags = loadCustomList(CUSTOM_TAGS_KEY);
  const customCategories = loadCustomList(CUSTOM_CATEGORIES_KEY);

  const tags = uniqueSorted([...entryTags, ...customTags]);
  const categories = uniqueSorted([...entryCategories, ...customCategories]);

  ui.tagList.innerHTML = "";
  tags.forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "btn-plain px-2.5 py-1 rounded-full text-sm whitespace-nowrap";
    button.textContent = tag;
    button.addEventListener("click", () => {
      const current = parseTags(ui.meta.tags.value);
      if (!current.includes(tag)) {
        current.push(tag);
        ui.meta.tags.value = current.join(", ");
        markAsDirty();
      }
    });
    ui.tagList.appendChild(button);
  });

  ui.categoryList.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "btn-plain px-2.5 py-1 rounded-full text-sm whitespace-nowrap";
    button.textContent = category;
    button.addEventListener("click", () => {
      ui.meta.category.value = category;
      markAsDirty();
    });
    ui.categoryList.appendChild(button);
  });
}

function addCustomItem(
  key: string,
  value: string,
  afterAdd?: () => void
) {
  const trimmed = value.trim();
  if (!trimmed) return;
  const list = loadCustomList(key);
  if (!list.includes(trimmed)) {
    list.push(trimmed);
    saveCustomList(key, list);
    if (afterAdd) afterAdd();
  }
}

// --- 脏检查和状态管理 ---

function markAsDirty() {
  if (!isDirty && state.currentFile.path) {
    isDirty = true;
    // 使用一个不同的颜色来表示“未保存到 GitHub”，但“已修改”
    ui.saveStatus.textContent = "未保存的更改 (本地草稿将在 5 秒后更新)";
    ui.saveStatus.className = "mt-2 text-right text-orange-500";
  }
  refreshSourceView();
}

function markAsClean() {
  isDirty = false;
  ui.saveStatus.textContent = "";
  ui.saveStatus.className = "mt-2 text-right text-sm"; // 恢复默认或清除
}

function setupChangeListeners() {
  // 移除旧的监听器以防重复（如果需要重新加载文件）
  // 对于简单的应用，我们假设只需要附加一次，但为了健壮性，我们可以检查。
  // 更简单的做法是：确保在每次加载新文件时都调用 markAsClean
  
  // 监听元数据输入变化
  Object.values(ui.meta).forEach(input => {
    input.addEventListener("input", markAsDirty);
    // 确保 date inputs 的 change 事件也被监听，因为它们有不同的触发机制
    if (input.type === "date") {
        input.addEventListener("change", markAsDirty);
    }
  });
}

// --- 草稿功能函数 ---

function getEditorMetadata(): Partial<Metadata> {
  return {
    title: ui.meta.title.value,
    published: ui.meta.published.value,
    updated: ui.meta.updated.value,
    description: ui.meta.description.value,
    tags: ui.meta.tags.value, // string
    category: ui.meta.category.value,
  };
}

function saveUnsavedNewFileDraft(metadata: Partial<Metadata>, body: string) {
  if (!state.currentFile.isNew || !state.currentFile.path) return;
  const payload: UnsavedNewFileDraft = {
    user: state.user,
    repo: state.repo,
    path: state.currentFile.path,
    metadata,
    body,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(UNSAVED_NEW_FILE_DRAFT_KEY, JSON.stringify(payload));
}

function clearUnsavedNewFileDraft() {
  localStorage.removeItem(UNSAVED_NEW_FILE_DRAFT_KEY);
}

function loadUnsavedNewFileDraft(): UnsavedNewFileDraft | null {
  const raw = localStorage.getItem(UNSAVED_NEW_FILE_DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<UnsavedNewFileDraft>;
    if (!parsed.user || !parsed.repo || !parsed.path) return null;
    if (String(parsed.user) !== state.user || String(parsed.repo) !== state.repo) {
      return null;
    }
    return {
      user: String(parsed.user),
      repo: String(parsed.repo),
      path: String(parsed.path),
      metadata: (parsed.metadata || {}) as Partial<Metadata>,
      body: typeof parsed.body === "string" ? parsed.body : "",
      savedAt:
        typeof parsed.savedAt === "string"
          ? parsed.savedAt
          : new Date().toISOString(),
    };
  } catch {
    localStorage.removeItem(UNSAVED_NEW_FILE_DRAFT_KEY);
    return null;
  }
}

function restoreUnsavedNewFileDraft() {
  const draft = loadUnsavedNewFileDraft();
  if (!draft) return;

  const savedDate = new Date(draft.savedAt).toLocaleString();
  const shouldRestore = confirm(
    `发现新建文件的未上传草稿（保存于 ${savedDate}），是否恢复继续编辑？`
  );
  if (!shouldRestore) {
    clearUnsavedNewFileDraft();
    return;
  }

  state.currentFile = {
    path: draft.path,
    sha: null,
    isNew: true,
  };
  ui.currentFileName.textContent = draft.path.split("/").pop() || "";
  populateEditor(draft.metadata, draft.body);
  ui.placeholderSection.classList.add("hidden");
  ui.editorSection.classList.remove("hidden");
  document
    .querySelectorAll("#file-list a")
    .forEach((el) =>
      el.classList.remove(
        "bg-[var(--btn-plain-bg-hover)]",
        "text-[var(--primary)]"
      )
    );
  setEditorHashByPath(draft.path, true);
  markAsDirty();
  showSaveStatus("已恢复新建文件草稿。", false);
}

function saveDraft() {
  if (!state.currentFile.path || !isDirty) return;
  const metadata = getEditorMetadata();
  const body = getEditorMarkdown();
  try {
      saveDraftToStorage(state, state.currentFile.path, metadata, body);
      saveUnsavedNewFileDraft(metadata, body);
      markAsClean(); // 草稿保存成功，将状态标记为 clean (clean = 草稿已是最新的)
      ui.saveStatus.textContent = `本地草稿已保存于 ${new Date().toLocaleTimeString()}`;
      ui.saveStatus.className = "mt-2 text-right text-gray-500 text-sm";
      setTimeout(() => ui.saveStatus.textContent = "", 3000);
  } catch (e: any) {
      console.error(e);
      showSaveStatus(e.message, true);
  }
}

// <--- 修改 loadDraft 签名，需要 originalContent 来进行比较
function loadDraft(path: string, originalContent: ParsedContent) {
  try {
    const draft = loadDraftFromStorage(state, path);
    if (draft) {
      // 1. 生成远程版本的完整 Markdown 字符串
      const originalFull = createFullMarkdown(originalContent.metadata, originalContent.body);
      
      // 2. 生成草稿版本的完整 Markdown 字符串
      const draftFull = createFullMarkdown(draft.metadata, draft.body);

      // 3. 比较两者。如果完全一致，则删除草稿并退出。
      if (originalFull.trim() === draftFull.trim()) {
        clearDraft(path);
        return; 
      }

      // 4. 如果不一致，则弹窗询问
      const savedDate = new Date(draft.savedAt).toLocaleString();
      if (
        confirm(`发现该文件于 ${savedDate} 保存的草稿。内容与远程版本不同，要加载草稿吗？`)
      ) {
        populateEditor(draft.metadata, draft.body);
        markAsDirty();
        // 加载草稿后，编辑器内容变脏，需要标记为 dirty。
        showSaveStatus("已从本地加载草稿。", false);
      } else {
        // 如果用户选择不加载，则清除草稿
        clearDraft(path);
      }
    }
  } catch (e: any) {
    console.error(e);
    showSaveStatus(e.message, true);
  }
}
function clearDraft(path: string) {
    clearDraftFromStorage(state, path);
}

// --- UI & 状态管理 ---

function showSaveStatus(message: string, isError: boolean = false) {
  ui.saveStatus.textContent = message;
  ui.saveStatus.className = isError
    ? "mt-2 text-right text-red-500" // 直接使用 Tailwind 类，因为不知道原生的 var(--error) 是什么
    : "mt-2 text-right text-green-500";
  setTimeout(() => (ui.saveStatus.textContent = ""), 5000);
}

function getCurrentSourceMarkdown(): string {
  const metadata = getEditorMetadata();
  const body = getEditorMarkdown();
  return createFullMarkdown(metadata, body);
}

function getSourceBodyOffset(source: string): number {
  if (!source.startsWith("---")) return 0;
  const frontmatterMatch = source.match(/^---\n[\s\S]*?\n---\n*/);
  return frontmatterMatch ? frontmatterMatch[0].length : 0;
}

function getMetadataSourceSelection(
  source: string
): { start: number; end: number } | null {
  const activeElement = document.activeElement;
  if (
    !(activeElement instanceof HTMLInputElement) &&
    !(activeElement instanceof HTMLTextAreaElement)
  ) {
    return null;
  }

  const fieldKeyMap: Record<string, string> = {
    "meta-title": "title",
    "meta-published": "published",
    "meta-updated": "updated",
    "meta-description": "description",
    "meta-tags": "tags",
    "meta-category": "category",
  };

  const fieldKey = fieldKeyMap[activeElement.id];
  if (!fieldKey) return null;

  const lines = source.split("\n");
  let offset = 0;
  for (const line of lines) {
    const prefix = `${fieldKey}:`;
    if (line.startsWith(prefix)) {
      const cursorOffset =
        typeof activeElement.selectionStart === "number"
          ? activeElement.selectionStart
          : activeElement.value.length;
      const start = offset + prefix.length + 1 + cursorOffset;
      return { start, end: start };
    }
    offset += line.length + 1;
  }

  return null;
}

function getEditorSelectionContext() {
  const editorRoot = document.querySelector("#markdown-editor .ProseMirror");
  if (!(editorRoot instanceof HTMLElement)) return null;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (
    !editorRoot.contains(range.startContainer) ||
    !editorRoot.contains(range.endContainer)
  ) {
    return null;
  }

  const startElement =
    range.startContainer instanceof Element
      ? range.startContainer
      : range.startContainer.parentElement;
  const blockElement = startElement?.closest(
    "p,li,h1,h2,h3,h4,h5,h6,blockquote,pre,td,th"
  );
  const parentText = blockElement?.textContent?.trim() ?? "";

  let parentBeforeText = "";
  if (blockElement) {
    const prefixRange = document.createRange();
    prefixRange.selectNodeContents(blockElement);
    prefixRange.setEnd(range.startContainer, range.startOffset);
    parentBeforeText = prefixRange.toString().trim();
  }

  const selectedText = selection.toString().trim();
  return {
    selectedText,
    parentText,
    parentBeforeText,
    aroundText: parentText,
    selectionEmpty: selection.isCollapsed,
  };
}

function findBestSourceSelection(source: string): { start: number; end: number } {
  const metadataSelection = getMetadataSourceSelection(source);
  if (metadataSelection) return metadataSelection;

  const bodyOffset = getSourceBodyOffset(source);
  const context = getEditorSelectionContext();
  if (!context) {
    return { start: bodyOffset, end: bodyOffset };
  }

  const directNeedles = [
    context.selectedText,
    context.aroundText.length >= 6 ? context.aroundText : "",
    context.parentText,
  ].filter((value) => value.length > 0);

  for (const needle of directNeedles) {
    const index = source.indexOf(needle, bodyOffset);
    if (index !== -1) {
      const end = context.selectedText && needle === context.selectedText
        ? index + needle.length
        : index;
      return { start: index, end };
    }
  }

  if (context.parentText) {
    const lines = source.split("\n");
    let offset = 0;

    for (const line of lines) {
      if (line.includes(context.parentText)) {
        const lineStart = offset;
        const prefix = context.parentBeforeText;
        if (prefix && line.includes(prefix)) {
          const prefixIndex = line.indexOf(prefix);
          const cursor = lineStart + prefixIndex + prefix.length;
          return { start: cursor, end: cursor };
        }

        const textIndex = line.indexOf(context.parentText);
        const cursor = lineStart + textIndex;
        return { start: cursor, end: cursor };
      }
      offset += line.length + 1;
    }
  }

  return { start: bodyOffset, end: bodyOffset };
}

function focusSourceSelection(start: number, end: number = start) {
  const max = ui.sourceContent.value.length;
  const safeStart = Math.max(0, Math.min(start, max));
  const safeEnd = Math.max(safeStart, Math.min(end, max));

  requestAnimationFrame(() => {
    ui.sourceContent.focus();
    ui.sourceContent.setSelectionRange(safeStart, safeEnd);

    const lineHeight =
      Number.parseFloat(getComputedStyle(ui.sourceContent).lineHeight) || 24;
    const linesBefore = ui.sourceContent.value.slice(0, safeStart).split("\n").length - 1;
    ui.sourceContent.scrollTop = Math.max(0, (linesBefore - 2) * lineHeight);
  });
}

function refreshSourceView() {
  if (ui.sourceModal.classList.contains("hidden")) return;
  ui.sourceContent.value = getCurrentSourceMarkdown();
}

function openSourceModal(alignWithCursor: boolean = false) {
  if (!state.currentFile.path) {
    showSaveStatus("请先选择或新建一篇文章。", true);
    return;
  }
  const source = getCurrentSourceMarkdown();
  ui.sourceContent.value = source;
  ui.sourceModal.classList.remove("hidden");

  if (alignWithCursor) {
    const { start, end } = findBestSourceSelection(source);
    focusSourceSelection(start, end);
  }
}

function closeSourceModal() {
  ui.sourceModal.classList.add("hidden");
}

async function handleCopySource() {
  await navigator.clipboard.writeText(ui.sourceContent.value);
  showSaveStatus("Markdown 源码已复制。", false);
}

function handleSourceShortcut(event: KeyboardEvent) {
  const isShortcut = (event.metaKey || event.ctrlKey) && event.code === "Slash";
  if (!isShortcut) return;

  event.preventDefault();
  openSourceModal(true);
}

function resetEditorState(clearHash: boolean = true) {
  ui.editorSection.classList.add("hidden");
  ui.placeholderSection.classList.remove("hidden");
  closeSourceModal();
  state.currentFile = { path: null, sha: null, isNew: false };
  if (clearHash) {
    setEditorHashByPath(null, true);
  }
  document
    .querySelectorAll("#file-list a")
    .forEach((el) =>
      el.classList.remove(
        "bg-[var(--btn-plain-bg-hover)]",
        "text-[var(--primary)]"
      )
    );
}

async function refreshFileList() {
  try {
    ui.fileList.innerHTML =
      "<li class='text-75 text-sm p-2'>正在加载文章列表...</li>";
    const entries = await buildFileEntries(await getFiles(state));
    cachedEntries = entries;
    renderFileList(entries);
    renderTagCategoryRegistry(entries);
  } catch (error) {
    showSaveStatus("无法刷新文件列表。", true);
  }
}

function renderFileList(entries: FileEntry[]) {
  ui.fileList.innerHTML = "";
  if (entries.length === 0) {
    ui.fileList.innerHTML =
      "<li class='text-75 text-sm p-2'>未找到 Markdown 文件</li>";
    return;
  }
  entries.forEach((entry) => {
    const a = document.createElement("a");
    a.dataset.path = entry.path;
    a.dataset.sha = entry.sha;
    a.className =
      "file-item block px-3 py-2 rounded-lg text-90 hover:bg-[var(--btn-plain-bg-hover)] transition cursor-pointer";
    a.href = "#";
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col w-full";
    const titleSpan = document.createElement("span");
    titleSpan.className = "text-sm font-medium text-90 truncate";
    titleSpan.textContent = entry.title;
    const dateSpan = document.createElement("span");
    dateSpan.className = "text-xs text-50";
    dateSpan.textContent = entry.dateLabel;
    wrapper.appendChild(titleSpan);
    wrapper.appendChild(dateSpan);
    a.appendChild(wrapper);
    ui.fileList.appendChild(a);

    // 如果这是当前活动文件，则重新选中
    if (state.currentFile.path === entry.path) {
      a.classList.add(
        "bg-[var(--btn-plain-bg-hover)]",
        "text-[var(--primary)]"
      );
    }
  });
}

function populateEditor(metadata: Partial<Metadata>, body: string) {
  ui.meta.title.value = metadata.title || "";
  ui.meta.published.value = metadata.published
    ? new Date(metadata.published).toISOString().split("T")[0]
    : "";
  ui.meta.updated.value = metadata.updated
    ? new Date(metadata.updated).toISOString().split("T")[0]
    : "";
  ui.meta.description.value = metadata.description || "";
  // 将标签数组转换为逗号分隔的字符串以在输入框中显示
  ui.meta.tags.value = Array.isArray(metadata.tags)
    ? metadata.tags.join(", ")
    : metadata.tags || "";
  ui.meta.category.value = metadata.category || "";
  setEditorMarkdown(body);
  refreshSourceView();
}

function setTodaysDate() {
  const today = new Date().toISOString().split("T")[0];
  ui.meta.published.value = today;
  ui.meta.updated.value = today;
}

async function applyFileContent(path: string, content: string, sha: string) {
  await ensureEditorReady();
  state.currentFile.path = path;
  state.currentFile.sha = sha;
  state.currentFile.isNew = false;
  clearUnsavedNewFileDraft();
  setEditorHashByPath(path);

  ui.placeholderSection.classList.add("hidden");
  ui.editorSection.classList.remove("hidden");
  ui.currentFileName.textContent = path.split("/").pop() || "";

  const originalContent = parseContent(content);
  populateEditor(originalContent.metadata, originalContent.body);
  if (!originalContent.metadata.published) setTodaysDate();
  markAsClean();
  loadDraft(path, originalContent);
}

async function loadFileForEditing(path: string) {
  saveDraft();
  try {
    const { content, sha } = await getFileContent(state, path);
    await applyFileContent(path, content, sha);
  } catch (error: any) {
    showSaveStatus(`加载文件失败: ${error.message}`, true);
    resetEditorState();
  }
}

// --- 核心动作处理器 ---

async function handleFileClick(e: Event) {
  const target = (e.target as HTMLElement).closest("a.file-item") as HTMLElement;
  if (!target) return;
  e.preventDefault();

  document.querySelectorAll("#file-list a").forEach((el) => {
    el.classList.remove(
      "bg-[var(--btn-plain-bg-hover)]",
      "text-[var(--primary)]"
    );
  });
  target.classList.add(
    "bg-[var(--btn-plain-bg-hover)]",
    "text-[var(--primary)]"
  );

  const path = target.dataset.path;
  if (!path) return;
  await loadFileForEditing(path);
}

async function confirmAndDeleteFile(path: string, sha: string | null) {
  if (state.currentFile.isNew) {
    resetEditorState();
    showSaveStatus("新文件编辑已取消。", false);
    return;
  }

  if (
    !confirm(
      `你确定要删除文件 "${path.split("/").pop()}" 吗？此操作无法撤销。`
    )
  )
    return;

  ui.deleteFileBtn.classList.add("btn-disabled");

  try {
    if (!sha) throw new Error("缺少文件 SHA 无法删除。");
    await deleteFile(state, path, sha);
    showSaveStatus("文件删除成功！", false);
    clearDraft(path);
    if (state.currentFile.path === path) resetEditorState();
    await refreshFileList();
  } catch (error: any) {
    showSaveStatus(`删除失败: ${error.message}`, true);
  } finally {
    ui.deleteFileBtn.classList.remove("btn-disabled");
  }
}

async function handleDeleteButtonClick() {
  if (!state.currentFile.path) {
    showSaveStatus("没有选定文件。", true);
    return;
  }
  await confirmAndDeleteFile(
    state.currentFile.path,
    state.currentFile.sha
  );
}

function handleNewFileClick() {
  ui.newFileInput.value = "";
  ui.newFileError.textContent = "";
  ui.newFileModal.classList.remove("hidden");
}

function handleCreateNewFile() {
  let filenameInput = ui.newFileInput.value.trim();
  if (!filenameInput) {
    ui.newFileError.textContent = "文件名不能为空。";
    return;
  }

  const filename = normalizeFilename(filenameInput);

  state.currentFile = {
    path: `src/content/posts/${filename}`,
    sha: null,
    isNew: true,
  };
  clearUnsavedNewFileDraft();
  setEditorHashByPath(state.currentFile.path);
  ui.currentFileName.textContent = filename;

  // 使用基本模板元数据初始化编辑器
  const templateMeta: Partial<Metadata> = {
    title: filenameInput,
    category: "",
    tags: [],
    description: "",
  };
  populateEditor(templateMeta, "");
  setTodaysDate();

  markAsDirty(); // <--- 新建文件后，它默认是 dirty 的，因为尚未保存到 GitHub

  ui.placeholderSection.classList.add("hidden");
  ui.editorSection.classList.remove("hidden");
  document
    .querySelectorAll("#file-list a")
    .forEach((el) =>
      el.classList.remove(
        "bg-[var(--btn-plain-bg-hover)]",
        "text-[var(--primary)]"
      )
    );
  ui.newFileModal.classList.add("hidden");
}

// --- 重命名逻辑 ---

function handleRenameClick() {
  if (!state.currentFile.path || state.currentFile.isNew) {
    showSaveStatus("请先选择一个已存在的文件进行重命名。", true);
    return;
  }
  const currentName = state.currentFile.path
    .split("/")
    .pop()!
    .replace(/\.md$/i, "");
  ui.renameFileInput.value = currentName;
  ui.renameFileError.textContent = "";
  ui.renameFileModal.classList.remove("hidden");
}

async function renameFileAction(oldPath: string, newFilename: string) {
  if (!state.currentFile.sha) {
    throw new Error("文件操作缺少 SHA。");
  }

  const metadata = getEditorMetadata();
  const body = getEditorMarkdown();
  const newContent = createFullMarkdown(metadata, body);

  const newPath = `src/content/posts/${newFilename}`;

  // 1. 删除旧文件
  await deleteFile(state, oldPath, state.currentFile.sha);

  // 2. 创建新文件
  const result = await createFile(state, newPath, newContent);

  // 3. 更新状态
  state.currentFile.path = newPath;
  state.currentFile.sha = result.content.sha;
  setEditorHashByPath(newPath);

  return result;
}

async function handleRenameConfirm() {
  const newNameInput = ui.renameFileInput.value.trim();
  if (!newNameInput) {
    ui.renameFileError.textContent = "新文件名不能为空。";
    return;
  }

  const newFilename = normalizeFilename(newNameInput);
  const oldPath = state.currentFile.path;

  if (!oldPath) return;

  if (oldPath.split("/").pop() === newFilename) {
    ui.renameFileError.textContent = "文件名未更改。";
    return;
  }

  ui.renameFileConfirmBtn.classList.add("btn-disabled");
  try {
    await renameFileAction(oldPath, newFilename);
    ui.currentFileName.textContent = newFilename;
    clearDraft(oldPath);
    showSaveStatus("文件重命名成功！", false);
    await refreshFileList();

    ui.renameFileModal.classList.add("hidden");
  } catch (error: any) {
    showSaveStatus(`重命名失败: ${error.message}`, true);
    ui.renameFileError.textContent = `重命名失败: ${error.message}`;
  } finally {
    ui.renameFileConfirmBtn.classList.remove("btn-disabled");
  }
}

// --- 保存处理器 ---

async function handleSave() {
  if (!state.currentFile.path) {
    showSaveStatus("没有选择要保存的文件。", true);
    return;
  }
  ui.saveSpinner.classList.remove("hidden");
  ui.saveBtn.classList.add("btn-disabled");
  try {
    const metadata = getEditorMetadata();
    const body = getEditorMarkdown();
    const newContent = createFullMarkdown(metadata, body);

    let result;
    if (state.currentFile.isNew) {
      result = await createFile(state, state.currentFile.path, newContent);
      await refreshFileList();
    } else {
      if (!state.currentFile.sha)
        throw new Error("更新文件缺少 SHA。请重新加载文件。");
      result = await updateFile(
        state,
        state.currentFile.path,
        newContent,
        state.currentFile.sha
      );
    }

    state.currentFile.sha = result.content.sha;
    state.currentFile.isNew = false;
    clearUnsavedNewFileDraft();
    clearDraft(state.currentFile.path);
    markAsClean(); // <--- 成功保存到 GitHub 后，标记为 clean
    showSaveStatus("文件保存成功！", false);

    const savedTags = parseTags(metadata.tags);
    let registryUpdated = false;
    if (savedTags.length > 0) {
      savedTags.forEach((tag) =>
        addCustomItem(CUSTOM_TAGS_KEY, tag, () => {
          registryUpdated = true;
        })
      );
    }
    if (metadata.category) {
      addCustomItem(CUSTOM_CATEGORIES_KEY, metadata.category, () => {
        registryUpdated = true;
      });
    }
    if (registryUpdated) {
      renderTagCategoryRegistry(cachedEntries);
    }
  } catch (error: any) {
    showSaveStatus(`保存失败: ${error.message}`, true);
  } finally {
    ui.saveSpinner.classList.add("hidden");
    ui.saveBtn.classList.remove("btn-disabled");
  }
}

function handleTestOutput() {
  const output = getCurrentSourceMarkdown();
  console.log(output);
  showSaveStatus("内容已输出到开发者控制台。", false);
}

function handleAddTag() {
  addCustomItem(CUSTOM_TAGS_KEY, ui.newTagInput.value, () => {
    renderTagCategoryRegistry(cachedEntries);
  });
  ui.newTagInput.value = "";
}

function handleAddCategory() {
  addCustomItem(CUSTOM_CATEGORIES_KEY, ui.newCategoryInput.value, () => {
    renderTagCategoryRegistry(cachedEntries);
  });
  ui.newCategoryInput.value = "";
}

// --- 登录/登出 ---

function parseSavedLoginData(): LoginData | null {
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

function applyLoginData(loginData: LoginData) {
  state.user = loginData.user;
  state.repo = loginData.repo;
  state.pat = loginData.pat;
}

function redirectToLogin() {
  const next = encodeURIComponent(
    `${window.location.pathname}${window.location.search}${window.location.hash}`
  );
  window.location.replace(`/login/?next=${next}`);
}

function logout() {
  localStorage.removeItem(LOGIN_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent("github-editor-auth-changed", {
      detail: { storageKey: LOGIN_STORAGE_KEY },
    })
  );
  state.user = state.repo = state.pat = "";
  resetEditorState(false);
  redirectToLogin();
}

async function loadFileBySlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const candidatePaths = [
    `src/content/posts/${normalizedSlug}.md`,
    `src/content/posts/${normalizedSlug}/index.md`,
  ];

  let lastError: unknown = null;
  for (const path of candidatePaths) {
    try {
      const { content, sha } = await getFileContent(state, path);
      await applyFileContent(path, content, sha);

      document.querySelectorAll("#file-list a").forEach((el: any) => {
        el.classList.remove(
          "bg-[var(--btn-plain-bg-hover)]",
          "text-[var(--primary)]"
        );
        if (el.dataset.path === path) {
          el.classList.add(
            "bg-[var(--btn-plain-bg-hover)]",
            "text-[var(--primary)]"
          );
        }
      });

      showSaveStatus(`已自动加载文章: ${path.split("/").pop()}`, false);
      return;
    } catch (error: any) {
      lastError = error;
    }
  }

  const message =
    lastError instanceof Error
      ? lastError.message
      : `未找到文章: ${slug}`;
  showSaveStatus(`加载指定文章失败: ${message}`, true);
}

function getCurrentPathSlug(): string | null {
  if (!state.currentFile.path) return null;
  return pathToSlug(state.currentFile.path);
}

async function handleEditorHashChange() {
  const hashSlug = getHashSlug();
  if (!hashSlug) return;
  if (getCurrentPathSlug() === hashSlug) return;
  await loadFileBySlug(hashSlug);
}


// --- 初始化 ---
export async function initializeApp() {
  loadInitialTheme();
  const loginData = parseSavedLoginData();
  if (!loginData) {
    redirectToLogin();
    return;
  }
  applyLoginData(loginData);

  await ensureEditorReady();

  setupChangeListeners(); // <--- 确保元数据输入框的监听器被设置

  if (draftInterval) clearInterval(draftInterval);
  draftInterval = setInterval(saveDraft, 5000) as unknown as number;

  window.addEventListener("beforeunload", saveDraft);

  // 事件监听器
  ui.logoutBtn.addEventListener("click", logout);
  ui.fileList.addEventListener("click", handleFileClick);

  ui.viewSourceBtn.addEventListener("click", () => openSourceModal(true));
  ui.testOutputBtn.addEventListener("click", handleTestOutput);
  ui.saveBtn.addEventListener("click", handleSave);

  ui.newFileBtn.addEventListener("click", handleNewFileClick);
  ui.createFileConfirmBtn.addEventListener("click", handleCreateNewFile);

  ui.deleteFileBtn.addEventListener("click", handleDeleteButtonClick);
  ui.renameFileBtn.addEventListener("click", handleRenameClick);
  ui.renameFileConfirmBtn.addEventListener("click", handleRenameConfirm);

  ui.themeToggle.addEventListener("click", handleThemeToggle);
  ui.addTagBtn.addEventListener("click", handleAddTag);
  ui.addCategoryBtn.addEventListener("click", handleAddCategory);

  ui.newTagInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  });
  ui.newCategoryInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddCategory();
    }
  });

  // Modal close buttons
  ui.newFileCancelBtn.addEventListener("click", () => {
    ui.newFileModal.classList.add("hidden");
  });
  ui.renameFileCancelBtn.addEventListener("click", () => {
    ui.renameFileModal.classList.add("hidden");
  });

  // Close modals on background click
  ui.newFileModal.addEventListener("click", (e) => {
    if (e.target === ui.newFileModal) {
      ui.newFileModal.classList.add("hidden");
    }
  });
  ui.renameFileModal.addEventListener("click", (e) => {
    if (e.target === ui.renameFileModal) {
      ui.renameFileModal.classList.add("hidden");
    }
  });
  ui.sourceCloseBtn.addEventListener("click", closeSourceModal);
  ui.sourceCopyBtn.addEventListener("click", () => {
    void handleCopySource();
  });
  ui.sourceModal.addEventListener("click", (e) => {
    if (e.target === ui.sourceModal) {
      closeSourceModal();
    }
  });
  document.addEventListener("keydown", handleSourceShortcut);
  window.addEventListener("hashchange", () => {
    void handleEditorHashChange();
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== LOGIN_STORAGE_KEY) return;
    const latest = parseSavedLoginData();
    if (!latest) {
      showSaveStatus("登录状态已失效，请重新登录。", true);
      logout();
      return;
    }
    applyLoginData(latest);
  });

  pendingSlug = getSlugFromUrl();

  try {
    if (!pendingSlug) {
      restoreUnsavedNewFileDraft();
    }
    await refreshFileList();
    if (pendingSlug) {
      const slug = pendingSlug;
      pendingSlug = null;
      await loadFileBySlug(slug);
    }
  } catch {
    showSaveStatus("登录信息无效，请重新登录。", true);
    logout();
  }
}

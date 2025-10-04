// src/scripts/editor.ts

import type {
  EditorState,
  CurrentFile,
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
  stringifyMetadata,
  normalizeFilename,
  saveDraftToStorage,
  loadDraftFromStorage,
  clearDraftFromStorage,
  createFullMarkdown,
} from "./utils";

// 假设 EasyMDE 已通过 CDN 全局加载
declare const EasyMDE: any;

// UI 元素引用
const ui = {
  loginView: document.getElementById("login-view") as HTMLElement,
  mainView: document.getElementById("main-view") as HTMLElement,
  loginBtn: document.getElementById("login-btn") as HTMLButtonElement,
  loginSpinner: document.getElementById("login-spinner") as HTMLElement,
  logoutBtn: document.getElementById("logout-btn") as HTMLButtonElement,
  userInput: document.getElementById("github-user") as HTMLInputElement,
  repoInput: document.getElementById("github-repo") as HTMLInputElement,
  patInput: document.getElementById("github-pat") as HTMLInputElement,
  loginError: document.getElementById("login-error") as HTMLElement,
  fileList: document.getElementById("file-list") as HTMLUListElement,
  editorSection: document.getElementById("editor-section") as HTMLElement,
  placeholderSection: document.getElementById(
    "placeholder-section"
  ) as HTMLElement,
  currentFileName: document.getElementById("current-file-name") as HTMLElement,
  saveBtn: document.getElementById("save-btn") as HTMLButtonElement,
  saveSpinner: document.getElementById("save-spinner") as HTMLElement,
  saveStatus: document.getElementById("save-status") as HTMLElement,
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

let easyMDE: any = null;
let draftInterval: number | null = null;

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

function saveDraft() {
  if (!state.currentFile.path || !easyMDE) return;
  const metadata = getEditorMetadata();
  const body = easyMDE.value();
  try {
      saveDraftToStorage(state, state.currentFile.path, metadata, body);
  } catch (e: any) {
      console.error(e);
      showSaveStatus(e.message, true);
  }
}

function loadDraft(path: string) {
  try {
    const draft = loadDraftFromStorage(state, path);
    if (draft) {
      const savedDate = new Date(draft.savedAt).toLocaleString();
      if (
        confirm(`发现该文件于 ${savedDate} 保存的草稿。要加载草稿吗？`)
      ) {
        populateEditor(draft.metadata, draft.body);
        showSaveStatus("已从本地加载草稿。", false);
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

function showLoginError(message: string) {
  ui.loginError.textContent = message;
  ui.loginError.classList.remove("hidden");
}

function showSaveStatus(message: string, isError: boolean = false) {
  ui.saveStatus.textContent = message;
  ui.saveStatus.className = isError
    ? "mt-2 text-right text-red-500" // 直接使用 Tailwind 类，因为不知道原生的 var(--error) 是什么
    : "mt-2 text-right text-green-500";
  setTimeout(() => (ui.saveStatus.textContent = ""), 5000);
}

function resetEditorState() {
  ui.editorSection.classList.add("hidden");
  ui.placeholderSection.classList.remove("hidden");
  state.currentFile = { path: null, sha: null, isNew: false };
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
    renderFileList(await getFiles(state));
  } catch (error) {
    showSaveStatus("无法刷新文件列表。", true);
  }
}

function renderFileList(files: any[]) {
  ui.fileList.innerHTML = "";
  const mdFiles = files.filter((file) => file.name.endsWith(".md"));
  if (mdFiles.length === 0) {
    ui.fileList.innerHTML =
      "<li class='text-75 text-sm p-2'>未找到 Markdown 文件</li>";
    return;
  }
  mdFiles.forEach((file) => {
    const a = document.createElement("a");
    a.dataset.path = file.path;
    a.dataset.sha = file.sha;
    a.className =
      "file-item block px-3 py-2 rounded-lg text-90 hover:bg-[var(--btn-plain-bg-hover)] transition cursor-pointer";
    a.href = "#";
    a.textContent = file.name;
    ui.fileList.appendChild(a);

    // 如果这是当前活动文件，则重新选中
    if (state.currentFile.path === file.path) {
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
  if (easyMDE) easyMDE.value(body);
}

function setTodaysDate() {
  const today = new Date().toISOString().split("T")[0];
  ui.meta.published.value = today;
  ui.meta.updated.value = today;
}

// --- 核心动作处理器 ---

async function handleFileClick(e: Event) {
  const target = (e.target as HTMLElement).closest("a.file-item") as HTMLElement;
  if (!target) return;
  e.preventDefault();

  // 在切换前保存当前打开文件的草稿
  saveDraft();

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

  state.currentFile.path = target.dataset.path || null;
  ui.placeholderSection.classList.add("hidden");
  ui.editorSection.classList.remove("hidden");
  ui.currentFileName.textContent = state.currentFile.path
    ? state.currentFile.path.split("/").pop()!
    : "";

  if (!state.currentFile.path) return;

  try {
    const { content, sha } = await getFileContent(state, state.currentFile.path);
    state.currentFile.sha = sha;
    state.currentFile.isNew = false;
    const { metadata, body } = parseContent(content);
    populateEditor(metadata, body);
    if (!metadata.published) setTodaysDate();

    // 在加载原始文件内容后，检查并加载草稿
    loadDraft(state.currentFile.path);
  } catch (error: any) {
    showSaveStatus(`加载文件失败: ${error.message}`, true);
    resetEditorState();
  }
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
  ui.currentFileName.textContent = filename;

  // 使用基本模板元数据初始化编辑器
  const templateMeta: Partial<Metadata> = {
    title: filenameInput,
    category: "",
    tags: [],
    description: "",
  };
  populateEditor(templateMeta, "在这里写下你的内容...");
  setTodaysDate();

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
  const body = easyMDE.value();
  const newContent = createFullMarkdown(metadata, body);

  const newPath = `src/content/posts/${newFilename}`;

  // 1. 删除旧文件
  await deleteFile(state, oldPath, state.currentFile.sha);

  // 2. 创建新文件
  const result = await createFile(state, newPath, newContent);

  // 3. 更新状态
  state.currentFile.path = newPath;
  state.currentFile.sha = result.content.sha;

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
    const body = easyMDE.value();
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
    clearDraft(state.currentFile.path);
    showSaveStatus("文件保存成功！", false);
  } catch (error: any) {
    showSaveStatus(`保存失败: ${error.message}`, true);
  } finally {
    ui.saveSpinner.classList.add("hidden");
    ui.saveBtn.classList.remove("btn-disabled");
  }
}

function handleTestOutput() {
  const metadata = getEditorMetadata();
  const body = easyMDE.value();
  const output = createFullMarkdown(metadata, body);
  console.log("--- 生成的文件内容 ---");
  console.log(output);
  console.log("------------------------------");
  showSaveStatus("内容已输出到开发者控制台。", false);
}

// --- 登录/登出 ---

async function login() {
  ui.loginError.classList.add("hidden");
  ui.loginSpinner.classList.remove("hidden");
  ui.loginBtn.classList.add("btn-disabled");
  state.user = ui.userInput.value.trim();
  state.repo = ui.repoInput.value.trim();
  state.pat = ui.patInput.value.trim();
  if (!state.user || !state.repo || !state.pat) {
    showLoginError("所有字段均为必填项。");
    ui.loginSpinner.classList.add("hidden");
    ui.loginBtn.classList.remove("btn-disabled");
    return;
  }
  try {
    const files = await getFiles(state);
    const loginData: LoginData = {
      user: state.user,
      repo: state.repo,
      pat: state.pat,
    };
    localStorage.setItem("github_editor_data", JSON.stringify(loginData));
    ui.loginView.classList.add("hidden");
    ui.mainView.classList.remove("hidden");
    renderFileList(files);
  } catch (error: any) {
    showLoginError(
      `登录失败: ${error.message}. 请检查您的信息和 PAT 权限。`
    );
  } finally {
    ui.loginSpinner.classList.add("hidden");
    ui.loginBtn.classList.remove("btn-disabled");
  }
}

function logout() {
  localStorage.removeItem("github_editor_data");
  state.user = state.repo = state.pat = "";
  resetEditorState();
  ui.mainView.classList.add("hidden");
  ui.loginView.classList.remove("hidden");
  ui.userInput.value = ui.repoInput.value = ui.patInput.value = "";
}

// --- URL 参数处理 ---
function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    slug: urlParams.get("slug"),
  };
}

async function loadFileBySlug(slug: string) {
  try {
    const files = await getFiles(state);
    const targetFile = files.find((file: any) => {
      const fileName = file.name.replace(".md", "");
      return fileName === slug;
    });

    if (targetFile) {
      // 模拟点击文件来加载它
      const mockEvent = {
        target: { closest: () => ({ dataset: { path: targetFile.path, sha: targetFile.sha }, classList: { add: () => {} } }) }
      } as unknown as Event; // 模拟一个包含 target.closest 的事件
      await handleFileClick(mockEvent);

      // 重新高亮正确的项目（因为 handleFileClick 的模拟可能不够完美）
      document.querySelectorAll("#file-list a").forEach((el: any) => {
        el.classList.remove(
            "bg-[var(--btn-plain-bg-hover)]",
            "text-[var(--primary)]"
        );
        if (el.dataset.path === targetFile.path) {
          el.classList.add(
              "bg-[var(--btn-plain-bg-hover)]",
              "text-[var(--primary)]"
          );
        }
      });
      showSaveStatus(`已自动加载文章: ${targetFile.name}`, false);
    } else {
      showSaveStatus(`未找到文章: ${slug}`, true);
    }
  } catch (error: any) {
    showSaveStatus(`加载指定文章失败: ${error.message}`, true);
  }
}

// --- 初始化 ---
export async function initializeApp() {
  loadInitialTheme();
  easyMDE = new EasyMDE({
    element: document.getElementById("markdown-editor"),
    spellChecker: false,
  });

  if (draftInterval) clearInterval(draftInterval);
  draftInterval = setInterval(saveDraft, 5000) as unknown as number;

  window.addEventListener("beforeunload", saveDraft);

  // 事件监听器
  ui.loginBtn.addEventListener("click", login);
  ui.logoutBtn.addEventListener("click", logout);
  ui.fileList.addEventListener("click", handleFileClick);

  ui.testOutputBtn.addEventListener("click", handleTestOutput);
  ui.saveBtn.addEventListener("click", handleSave);

  ui.newFileBtn.addEventListener("click", handleNewFileClick);
  ui.createFileConfirmBtn.addEventListener("click", handleCreateNewFile);

  ui.deleteFileBtn.addEventListener("click", handleDeleteButtonClick);
  ui.renameFileBtn.addEventListener("click", handleRenameClick);
  ui.renameFileConfirmBtn.addEventListener("click", handleRenameConfirm);

  ui.themeToggle.addEventListener("click", handleThemeToggle);

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

  const savedData = localStorage.getItem("github_editor_data");
  if (savedData) {
    const { user, repo, pat }: LoginData = JSON.parse(savedData);
    ui.userInput.value = user;
    ui.repoInput.value = repo;
    ui.patInput.value = pat;
    await login();

    const params = getUrlParams();
    if (params.slug) {
      await loadFileBySlug(params.slug);
    }
  }
}
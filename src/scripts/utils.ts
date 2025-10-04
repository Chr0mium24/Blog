// src/scripts/utils.ts

import type { EditorState, Metadata, ParsedContent, Draft } from "./types";

// 假设 jsyaml 已通过 CDN 全局加载
declare const jsyaml: any;

// --- 工具 & API 函数 ---

export function encodeContent(content: string): string {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(content);
  let binaryString = "";
  uint8Array.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });
  return btoa(binaryString);
}

export function decodeContent(base64: string): string {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}

// GitHub API 核心请求
export async function githubApiRequest(
  state: EditorState,
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `https://api.github.com/repos/${state.user}/${state.repo}/${endpoint}`;
  const headers = {
    Authorization: `token ${state.pat}`,
    Accept: "application/vnd.github.v3+json",
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    if (response.status === 204) {
      return { success: true };
    }
    return await response.json();
  } catch (error) {
    console.error("GitHub API 错误:", error);
    throw error;
  }
}

// 获取文件列表
export function getFiles(state: EditorState): Promise<any> {
  // 假设博客文章位于 src/content/posts
  return githubApiRequest(state, "contents/src/content/posts");
}

// 获取文件内容
export async function getFileContent(
  state: EditorState,
  path: string
): Promise<{ content: string; sha: string }> {
  const data = await githubApiRequest(state, `contents/${path}`);
  return {
    content: decodeContent(data.content),
    sha: data.sha,
  };
}

// 创建文件
export function createFile(
  state: EditorState,
  path: string,
  content: string
): Promise<any> {
  return githubApiRequest(state, `contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `docs: create ${path.split("/").pop()}`,
      content: encodeContent(content),
    }),
  });
}

// 更新文件
export function updateFile(
  state: EditorState,
  path: string,
  content: string,
  sha: string
): Promise<any> {
  return githubApiRequest(state, `contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `docs: update ${path.split("/").pop()}`,
      content: encodeContent(content),
      sha,
    }),
  });
}

// 删除文件
export function deleteFile(
  state: EditorState,
  path: string,
  sha: string
): Promise<any> {
  return githubApiRequest(state, `contents/${path}`, {
    method: "DELETE",
    body: JSON.stringify({
      message: `docs: delete ${path.split("/").pop()}`,
      sha,
    }),
  });
}

// --- 内容解析与序列化 ---

export function parseContent(content: string): ParsedContent {
  const parts = content.split("---");
  if (parts.length < 3) return { metadata: {}, body: content };
  try {
    const metadata = jsyaml.load(parts[1]) || {};
    const body = parts.slice(2).join("---").trim();
    return { metadata, body };
  } catch (e) {
    console.error("解析 YAML元数据时出错:", e);
    return { metadata: {}, body: content };
  }
}

export function stringifyMetadata(metadata: Partial<Metadata>): string {
  const cleanMeta = { ...metadata };

  // 确保 tags 字段总是一个数组
  if (typeof cleanMeta.tags === "string") {
    cleanMeta.tags = cleanMeta.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  } else if (!Array.isArray(cleanMeta.tags)) {
    cleanMeta.tags = [];
  }

  // 使用 js-yaml 生成 YAML 字符串
  const yamlString = jsyaml.dump(cleanMeta, {
    lineWidth: -1,
    noQuotes: true,
    flowLevel: 1,
  });

  const lines = yamlString.split("\n");
  const processedLines = lines.map((line:string) => {
    if (
      line.startsWith("published:") ||
      line.startsWith("updated:") ||
      line.startsWith("tags:")
    ) {
      // 移除 js-yaml 可能添加的单引号
      return line.replace(/'/g, "");
    }
    return line;
  });

  return processedLines.filter((line:string) => line).join("\n");
}

export function createFullMarkdown(metadata: Partial<Metadata>, body: string): string {
    return `---\n${stringifyMetadata(metadata)}\n---\n\n${body}`;
}

// --- 草稿功能 ---

export function getDraftKey(state: EditorState, path: string | null): string | null {
  if (!path) return null;
  return `draft_${state.user}_${state.repo}_${path}`;
}

export function saveDraftToStorage(state: EditorState, path: string, metadata: Partial<Metadata>, body: string) {
    const key = getDraftKey(state, path);
    if (!key) return;

    const draft: Draft = {
        metadata,
        body,
        savedAt: new Date().toISOString(),
    };

    try {
        localStorage.setItem(key, JSON.stringify(draft));
    } catch (e) {
        console.error("保存草稿到 localStorage 时出错:", e);
        // 在主脚本中处理错误提示
        throw new Error("无法保存草稿，可能是存储空间已满。");
    }
}

export function loadDraftFromStorage(state: EditorState, path: string): Draft | null {
    const key = getDraftKey(state, path);
    if (!key) return null;

    const draftString = localStorage.getItem(key);
    if (draftString) {
        try {
            return JSON.parse(draftString) as Draft;
        } catch (e) {
            console.error("加载草稿时出错:", e);
            // 清理损坏的草稿
            localStorage.removeItem(key);
            throw new Error("加载草稿失败，草稿数据可能已损坏。");
        }
    }
    return null;
}

export function clearDraftFromStorage(state: EditorState, path: string) {
    const key = getDraftKey(state, path);
    if (key) {
        localStorage.removeItem(key);
    }
}

// --- 其他工具函数 ---

export function normalizeFilename(name: string): string {
  let filename = name.trim();
  // 格式化文件名：小写，空格/非字母数字（点/连字符除外）转为连字符
  filename = filename
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-.]/g, "");

  // 如果不存在，则添加 .md 后缀
  if (!filename.endsWith(".md")) filename += ".md";
  return filename;
}
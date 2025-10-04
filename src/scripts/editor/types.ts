// src/scripts/types.ts

// 定义配置状态
export interface EditorState {
  user: string;
  repo: string;
  pat: string;
  currentFile: CurrentFile;
}

// 定义当前文件状态
export interface CurrentFile {
  path: string | null;
  sha: string | null;
  isNew: boolean;
}

// 定义博客文章的 Frontmatter 元数据
export interface Metadata {
  title: string;
  published: string;
  updated: string;
  description: string;
  tags: string | string[]; // 在 UI 中是 string，在 YAML 中是 string[]
  category: string;
}

// 定义内容解析结果
export interface ParsedContent {
  metadata: Partial<Metadata>;
  body: string;
}

// 定义 localStorage 中的登录数据
export interface LoginData {
  user: string;
  repo: string;
  pat: string;
}

// 定义草稿数据
export interface Draft {
    metadata: Partial<Metadata>;
    body: string;
    savedAt: string;
}
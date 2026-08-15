import type { SerializedEditorState } from "lexical"

import type { ApiResponse } from "./db"

export type BlogStatus = "draft" | "published"

export interface Blog {
  id: string
  title: string
  contentHtml: string | null
  image: string
  author: string
  authorId: string | null
  authorSlug: string | null
  category: string
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  slug: string | null
  likes: number
  status: BlogStatus
}

export interface PublicBlog extends Blog {
  contentHtml: string
  publishedAt: string
  slug: string
  status: "published"
}

export interface EditableBlog extends Blog {
  editorState: SerializedEditorState
  plainText: string
}

export interface BlogInput {
  title: string
  editorState: SerializedEditorState
  image: string
  category: string
  status: BlogStatus
}

export interface BlogArticleData {
  title: string
  contentHtml: string
  image: string
  author: string
  authorSlug: string | null
  category: string
  publishedAt: string
}

export interface BlogPreviewAuthor {
  name: string
  slug: string | null
}

export interface DraftSummary {
  id: string
  title: string
  snippet: string
  updatedAt: string
}

export interface DashboardPostSummary {
  id: string
  title: string
  category: string
  status: BlogStatus
  likes: number
  createdAt: string
  updatedAt: string
  slug: string | null
}

export interface AdminPostSummary {
  id: string
  title: string
  author: string
  category: string
  status: BlogStatus
  createdAt: string
  updatedAt: string
}

export interface BlogResponse extends ApiResponse<EditableBlog> {
  blog?: EditableBlog
}

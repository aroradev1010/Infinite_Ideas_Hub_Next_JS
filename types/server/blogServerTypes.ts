import type { SerializedEditorState } from "lexical"
import type { ObjectId } from "mongodb"

import type { BlogStatus } from "@/types/blogType"

export interface BlogDocument {
  _id: ObjectId
  title: string
  editorState: SerializedEditorState
  contentHtml: string | null
  image: string
  category: string
  status: BlogStatus
  slug: string | null
  authorId: ObjectId
  authorName: string
  authorSlug: string | null
  likes: number
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

export type BlogInsert = Omit<BlogDocument, "_id">

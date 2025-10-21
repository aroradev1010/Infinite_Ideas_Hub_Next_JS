// types/server/blogServerTypes.ts
import { ObjectId } from "mongodb";

/**
 * Shape used when inserting a blog document into MongoDB.
 * This file is server-only — never import into client code.
 */
export interface BlogInsert {
  title: string;
  description: string;
  image?: string;
  category?: string;
  slug: string;
  likes: number;
  status: "published" | "draft";
  createdAt: Date;
  updatedAt: Date;
  authorId: ObjectId;
  authorName: string;
  authorSlug?: string | null;
}

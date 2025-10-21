// types/blogType.ts (polished suggestions)
import { ObjectId } from "mongodb";
import { ApiResponse } from "./db";

export interface Blog {
  id: string;
  title: string;
  description: string;
  image?: string;        // optional on client
  author: string;       // display name
  authorId?: string | null;
  authorSlug?: string | null;
  category?: string;
  createdAt: string;    // ISO string
  slug: string;
  likes: number;
  status: "published" | "draft";
}

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

export interface BlogInput {
  title: string;
  description: string;
  image?: string;
  category?: string;
  status?: "published" | "draft";
  slug?: string;
}

export type BlogUpdate = Partial<BlogInput>; // for PATCH bodies

export interface BlogResponse extends ApiResponse<Blog> {
  // optional convenience alias preserved if you want to keep 'blog' key
  blog?: Blog;
}

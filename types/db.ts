// types/db.ts
import { ObjectId } from "mongodb";

/**
 * Shape used to insert blog documents into MongoDB (authorId is ObjectId)
 */
export interface BlogInsert {
  title: string;
  description: string;
  image: string;
  category: string;
  slug: string;
  likes: number;
  status: "published" | "draft";
  createdAt: Date;
  updatedAt: Date;
  authorId: ObjectId;
  authorName: string;
  authorSlug?: string | null;
}

/**
 * User item returned by admin/user listings
 */
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  createdAt: string;
}

// types/server/draftServerTypes.ts
import { ObjectId } from "mongodb";

/**
 * Shape used when inserting a draft document into MongoDB.
 * This file is server-only — never import into client code.
 */
export interface DraftInsert {
  userId: ObjectId;
  blogId?: ObjectId | null;
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  status?: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

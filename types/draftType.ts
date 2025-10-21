// types/draftType.ts
import { ApiResponse } from "./db";

export interface Draft {
  id: string;
  userId: string;
  blogId?: string | null;
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface DraftInput {
  draftId?: string;
  blogId?: string | null;
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  status?: "draft" | "published";
}

export type DraftUpdate = Partial<DraftInput>;

export interface DraftResponse extends ApiResponse<Draft> {
  draft?: Draft;
}

export interface DraftListResponse extends ApiResponse<Draft[]> {
  drafts?: Draft[];
}

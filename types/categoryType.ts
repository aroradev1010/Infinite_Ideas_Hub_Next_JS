// types/categoryType.ts
import { ApiResponse } from "./db";

export interface Category {
  id: string;
  name: string;
  slug: string;
  categoryImage?: string;
  description?: string;
  createdAt: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
  categoryImage?: string;
}

export interface CategoryResponse extends ApiResponse<Category> {
  category?: Category;
}

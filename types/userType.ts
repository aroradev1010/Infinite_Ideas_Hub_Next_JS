// types/userType.ts
import { ApiResponse } from "./db";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "author" | "admin";
  image?: string;
  createdAt: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  createdAt: string;
}

export interface UserResponse extends ApiResponse<User> {
  user?: User;
}

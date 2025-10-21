// types/authorType.ts
import { ObjectId } from "mongodb";
import { ApiResponse } from "./db";

export interface Author {
  id: string;
  userId: string; // link to users._id
  name: string;
  bio: string;
  profileImage: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorInput {
  name: string;
  bio?: string;
  profileImage?: string;
}

export interface AuthorResponse extends ApiResponse<Author> {
  author?: Author;
}


export interface AuthorDoc {
  _id: ObjectId;
  userId: ObjectId;
  name?: string;
  bio?: string;
  profileImage?: string;
  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface Blog {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string; // display name
  authorId?: string | null;
  authorSlug?: string | null;
  category: string;
  createdAt: string;
  slug: string;
  likes: number;
  status: "published" | "draft";
}

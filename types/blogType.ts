export interface Blog {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  category: string;
  createdAt: string;
  slug: string;
  likes?: number; 
}

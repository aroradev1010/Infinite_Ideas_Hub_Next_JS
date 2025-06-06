// components/LatestArticles.tsx
import { getAllBlogs } from "@/lib/blogService";
import BlogCard from "./BlogCard";

export default async function LatestArticles() {
  const blogs = await getAllBlogs();

  return (
    <div className="my-10  w-full border-r px-10 xl:pr-10">
      <h1 className="font-bold text-md px-4 mb-10 uppercase tracking-wider">
        Latest Articles
      </h1>
      <div className="space-y-14">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  );
}

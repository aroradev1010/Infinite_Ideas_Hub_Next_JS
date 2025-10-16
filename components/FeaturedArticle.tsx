// components/FeaturedArticle.tsx
import BlogCard from "./BlogCard";
import { Blog } from "@/types/blogType";

interface Props {
  blog: Blog;
}

export default function FeaturedArticle({ blog }: Props) {
  return (
    <div className="my-10 border-b pb-7 px-10 xl:px-0">
      <h1 className="font-bold text-md px-4 mb-5 uppercase tracking-wider">
        Featured Article
      </h1>
      <BlogCard
        blog={blog}
        classNameDesktopImage="w-[430px] h-[280px] rounded-xl"
        webkitLineCLamp={3}
      />
    </div>
  );
}

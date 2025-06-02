// components/BlogCard.tsx

import Link from "next/link";
import Image from "next/image";
import SecondaryButton from "./SecondaryButton";
import { Blog } from "@/types/blogType";

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blog/${blog.id}`} key={blog.id}>
      <div className="grid xl:grid-cols-3 gap-5 group border-b pb-10">
        {/* Desktop Image (circular) */}
        <div className="hidden xl:flex justify-center">
          <Image
            src={blog.image.trimEnd() || "/fallback.avif"}
            alt={blog.title}
            width={180}
            height={180}
            className="rounded-full object-cover w-[180px] h-[180px]"
          />
        </div>

        {/* Mobile/Tablet Image (banner) */}
        <div className="w-full h-[200px] md:h-[400px] relative xl:hidden">
          <Image
            src={blog.image.trimEnd() || "/fallback.avif"}
            alt={blog.title}
            fill
            className="rounded-2xl object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="xl:col-span-2 xl:space-y-3 space-y-5">
          <h2 className="text-2xl md:text-3xl font-extrabold capitalize">
            {blog.title}
          </h2>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span>{blog.author}</span>
            <span>|</span>
            <span>{new Date(blog.createdAt).toDateString()}</span>
          </div>
          <p className="text-lg text-gray-400 font-medium line-clamp-2">
            {blog.description}
          </p>
          <SecondaryButton>{blog.category}</SecondaryButton>
        </div>
      </div>
    </Link>
  );
}

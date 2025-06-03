import Link from "next/link";
import Image from "next/image";
import SecondaryButton from "./SecondaryButton";
import { Blog } from "@/types/blogType";

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <div className="grid xl:grid-cols-3 gap-5 group">
      {/* Desktop Image (circular) */}
      <Link href={`/blog/${blog.slug}`} key={blog.id}>
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
      </Link>
      {/* Text Content */}
      <div className="xl:col-span-2">
        <Link href={`/blog/${blog.slug}`}>
          <h2 className="text-2xl md:text-3xl font-extrabold capitalize mb-3">
            {blog.title}
          </h2>
        </Link>
        <div className="flex items-center gap-3 mb-3 text-md font-bold tracking-wider">
          <Link
            href={`/authors/${blog.author
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9\s-]/g, "") // remove invalid characters
              .replace(/\s+/g, "-") // replace spaces with -
              .replace(/-+/g, "-")}`}
          >
            <span className="capitalize text-gray-400 hover:text-primary">
              By {blog.author}
            </span>
          </Link>
          <Link href={`/blog/${blog.slug}`} key={blog.id}>
            <span className="text-gray-700">/</span>
            <span className="text-gray-400">
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </Link>
        </div>
        <Link href={`/blog/${blog.slug}`} key={blog.id}>
          <p className="text-lg text-gray-400 font-medium line-clamp-2 mb-5">
            {blog.description}
          </p>
        </Link>
        <Link href={`/categories/${blog.category.toLowerCase()}`}>
          <SecondaryButton>{blog.category}</SecondaryButton>
        </Link>
      </div>
    </div>
  );
}

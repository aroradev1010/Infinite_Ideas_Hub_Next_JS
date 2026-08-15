import Link from "next/link";
import Image from "next/image";
import SecondaryButton from "./SecondaryButton";
import type { PublicBlog } from "@/types/blogType";
import { formatDate, slugify } from "@/lib/utils";

interface BlogCardProps {
  blog: PublicBlog;
  classNameDesktopImage?: string;
  webkitLineCLamp?: number;
}

function htmlToPlainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default function BlogCard({
  blog,
  classNameDesktopImage,
  webkitLineCLamp,
}: BlogCardProps) {
  const description = htmlToPlainText(blog.contentHtml);

  return (
    <div className="grid gap-5 xl:grid-cols-3 group">
      {/* Desktop Image */}
      <Link href={`/blog/${blog.slug}`}>
        <div className="hidden xl:flex justify-center">
          <Image
            src={blog.image?.trimEnd() || "/fallback.avif"}
            alt={blog.title}
            width={180}
            height={180}
            className={`h-45 w-45 rounded-full object-cover ${
              classNameDesktopImage || ""
            }`}
          />
        </div>

        {/* Mobile / Tablet Image */}
        <div className="relative h-50 w-full md:h-100 xl:hidden">
          <Image
            src={blog.image?.trimEnd() || "/fallback.avif"}
            alt={blog.title}
            fill
            className="rounded-2xl object-cover"
          />
        </div>
      </Link>

      {/* Text Content */}
      <div className="xl:col-span-2">
        <Link href={`/blog/${blog.slug}`}>
          <h2 className="mb-3 text-2xl font-extrabold capitalize md:text-3xl">
            {blog.title}
          </h2>
        </Link>

        {/* Author + Date */}
        <div className="mb-3 text-md font-bold tracking-wider">
          <Link href={`/authors/${blog.authorSlug ?? slugify(blog.author)}`}>
            <span className="capitalize text-gray-400 transition-colors hover:text-primary">
              By {blog.author}
            </span>
          </Link>

          <span className="mx-3 text-gray-700">/</span>

          <Link href={`/blog/${blog.slug}`}>
            <span className="text-gray-400">
              {formatDate(blog.publishedAt)}
            </span>
          </Link>
        </div>

        {/* Plain-text Blog Preview */}
        <Link href={`/blog/${blog.slug}`}>
          <div className="mb-5 overflow-hidden">
            <p
              className="tracking-wide text-gray-400 leading-relaxed"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: webkitLineCLamp || 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </p>
          </div>
        </Link>

        {/* Category */}
        <Link href={`/categories/${slugify(blog.category || "uncategorized")}`}>
          <SecondaryButton>{blog.category}</SecondaryButton>
        </Link>
      </div>
    </div>
  );
}
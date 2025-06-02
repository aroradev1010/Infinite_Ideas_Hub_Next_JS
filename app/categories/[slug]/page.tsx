// app/categories/[slug]/page.tsx

import StarBackground from "@/components/StarBackground";
import { getCategoryBySlug } from "@/lib/categoryService";
import { getBlogsByCategory } from "@/lib/blogService";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return notFound();

  const blogs = await getBlogsByCategory(category.name);

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* ─── Category Header ───────────────────────────────────────────────────────── */}
      <div className="h-96">
        <StarBackground
          imageSrc="/fallback.avif"
          text={category.name}
          imageClassName="rounded-full h-[100px] w-[100px] mb-2"
        />
      </div>

      {/* ─── Category’s Blogs List ─────────────────────────────────────────────────── */}
      <div className="space-y-12">
        {blogs.map((blog) => (
          <Link
            href={`/blog/${blog.id}`}
            key={blog.id}
            className="grid xl:grid-cols-3 group border-b pb-5"
          >
            {/* Desktop Image */}
            <div className="hidden xl:flex justify-center">
              <Image
                src={blog.image?.trimEnd() || "/fallback.avif"}
                alt={blog.title}
                width={180}
                height={180}
                className="rounded-full object-cover w-[180px] h-[180px]"
              />
            </div>

            {/* Mobile/Tablet Image */}
            <div className="w-full h-[200px] md:h-[400px] relative xl:hidden">
              <Image
                src={blog.image?.trimEnd() || "/fallback.avif"}
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
              <span className="inline-block bg-secondary rounded-full px-4 py-2 text-sm font-semibold text-gray-300 capitalize">
                {blog.category}
              </span>
            </div>
          </Link>
        ))}

        {blogs.length === 0 && (
          <p className="text-center text-gray-500">
            No articles found in this category.
          </p>
        )}
      </div>
    </div>
  );
}

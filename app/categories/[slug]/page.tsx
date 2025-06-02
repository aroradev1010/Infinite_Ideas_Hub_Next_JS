// app/categories/[slug]/page.tsx

import StarBackground from "@/components/StarBackground";
import { getCategoryBySlug } from "@/lib/categoryService";
import { getBlogsByCategory } from "@/lib/blogService";
import { notFound } from "next/navigation";
import BlogCard from "@/components/BlogCard";

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
    <div className="mb-20">
      {/* ─── Category Header ───────────────────────────────────────────────────────── */}
      <div className="h-96">
        <StarBackground
          imageSrc="/fallback.avif"
          text={category.name}
          imageClassName="rounded-full h-[100px] w-[100px] mb-2"
        />
      </div>

      {/* ─── Category’s Blogs List ─────────────────────────────────────────────────── */}
      <div className="space-y-12 max-w-6xl mx-auto px-4">
        {blogs.map((blog) => (
          <div key={blog.id}>
            <BlogCard key={blog.id} blog={blog} />
            <div className="my-10" />
          </div>
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

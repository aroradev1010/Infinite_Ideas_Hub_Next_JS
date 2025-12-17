// app/categories/[slug]/page.tsx

import StarBackground from "@/components/StarBackground";
import { getCategoryBySlug } from "@/lib/categoryService";
import { getBlogsByCategory } from "@/lib/blogService.server";
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
    <div className="h-screen">
      {/* ─── Category Header ───────────────────────────────────────────────────────── */}
      <div className="h-96">
        <StarBackground
          imageSrc={category.categoryImage || ""}
          text={category.name}
          imageClassName="rounded-full h-[100px] w-[100px] mb-2"
        />
      </div>

      {/* ─── Category’s Blogs List ─────────────────────────────────────────────────── */}
      <div className="space-y-12 max-w-6xl mx-auto px-4 mt-10">
        {blogs.map((blog) => (
          <div key={blog.id}>
            <BlogCard
              key={blog.slug}
              blog={blog}
              webkitLineCLamp={3}
              classNameDesktopImage="w-full rounded-xl h-[200px]"
            />
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

// app/categories/[slug]/page.tsx
import { getCategoryBySlug } from "@/lib/categoryService";
import { getBlogsByCategory } from "@/lib/blogService";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* ─── Category Header ─────────────────────────────────────────────── */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold capitalize">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-400">{category.description}</p>
        )}
        <span className="mt-1 block text-sm text-gray-500">
          Created {new Date(category.createdAt).toDateString()}
        </span>
      </div>

      {/* ─── Blogs List ──────────────────────────────────────────────────── */}
      <h2 className="text-2xl font-semibold mb-6">
        Articles in “{category.name}”
      </h2>
      <div className="space-y-10">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blog/${blog.id}`}
            className="
              flex flex-col lg:flex-row gap-6
              bg-gray-900 p-6 rounded-2xl
              hover:bg-gray-800 transition-colors duration-200
            "
          >
            {/* Thumbnail (desktop: fixed square; mobile: banner) */}
            <div className="hidden lg:block w-[200px] h-[200px] relative flex-shrink-0">
              <Image
                src={blog.image || "/fallback.jpg"}
                alt={blog.title}
                fill
                className="rounded-2xl object-cover"
              />
            </div>
            <div className="lg:hidden w-full h-[180px] relative">
              <Image
                src={blog.image || "/fallback.jpg"}
                alt={blog.title}
                fill
                className="rounded-2xl object-cover"
              />
            </div>

            {/* Text Content */}
            <div>
              <h3 className="text-2xl font-bold mb-2 capitalize">
                {blog.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>By {blog.author}</span>
                <span>•</span>
                <span>{new Date(blog.createdAt).toDateString()}</span>
              </div>
              <p className="text-gray-400 line-clamp-2 mb-3">
                {blog.description}
              </p>
              <span className="inline-block bg-secondary rounded-full px-3 py-1 text-sm font-bold text-gray-300 capitalize">
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

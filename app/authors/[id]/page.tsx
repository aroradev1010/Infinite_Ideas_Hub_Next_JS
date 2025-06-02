// app/authors/[id]/page.tsx
import BlogCard from "@/components/BlogCard";
import StarBackground from "@/components/StarBackground";
import { getAuthorById } from "@/lib/authorService";
import { getBlogsByAuthor } from "@/lib/blogService";
import { notFound } from "next/navigation";

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1️⃣ Await params (Next.js App Router requirement)
  const { id } = await params;

  // 2️⃣ Fetch author details
  const author = await getAuthorById(id);
  if (!author) return notFound();

  // 3️⃣ Fetch all blogs by this author
  const blogs = await getBlogsByAuthor(author.name);

  return (
    <div className="">
      {/* ─── Author Header ───────────────────────────────────────────────────────── */}
      <div className="h-96">
        <StarBackground
          imageSrc={author.profileImage || "/fallback.avif"}
          text={author.name}
          imageClassName="rounded-full h-[100px] w-[100px] mb-2"
        />
      </div>

      {/* ─── Author’s Blogs List ─────────────────────────────────────────────────── */}

      <div className="space-y-12 max-w-6xl mx-auto px-4">
        {blogs.map((blog) => (
          <div key={blog.id}>
            <BlogCard key={blog.id} blog={blog} />
            <div className="my-10" />
          </div>
        ))}

        {blogs.length === 0 && (
          <p className="text-center text-gray-500">
            No articles written by this author yet.
          </p>
        )}
      </div>
    </div>
  );
}

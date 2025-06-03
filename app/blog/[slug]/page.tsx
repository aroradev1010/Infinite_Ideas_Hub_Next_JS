import { getBlogBySlug } from "@/lib/blogService";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-5 text-gray-300">
        <span className="capitalize">{blog.author}</span>
        <span>/</span>
        <span className="font-extralight">
          {new Date(blog.createdAt).toLocaleDateString()}
        </span>
      </div>
      <Image
        src={blog.image.trimEnd() || "/fallback.avif"}
        alt={blog.title}
        width={1000}
        height={500}
        className="rounded-xl object-cover w-full h-auto mb-8"
      />
      <h1 className="text-4xl font-bold mb-4 capitalize">{blog.title}</h1>

      <p className="text-2xl text-gray-400 leading-relaxed mt-6">
        {blog.description}
      </p>
    </div>
  );
}

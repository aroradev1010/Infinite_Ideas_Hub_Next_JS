import { getBlogBySlug, getNextOrOldestBlog } from "@/lib/blogService";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return notFound();
  const nextBlog = await getNextOrOldestBlog(new Date(blog.createdAt));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-3 text-md font-bold tracking-wider">
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
          <span className="text-gray-700 mx-3">/</span>
          <span className="text-gray-400 ">
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </Link>
      </div>
      <Image
        src={blog.image.trimEnd() || "/fallback.avif"}
        alt={blog.title}
        width={800}
        height={800}
        className="rounded-xl object-cover w-full h-[500px] mb-8"
      />
      <h1 className="text-4xl font-bold mb-4 capitalize">{blog.title}</h1>

      <p className="text-2xl text-gray-400 leading-relaxed mt-6">
        {blog.description}
      </p>

      {nextBlog && (
        <div className="my-20">
          <h1 className="font-bold text-md px-4 mb-5 uppercase tracking-wider ">
            Next Article
          </h1>
          <Link
            href={`/blog/${nextBlog.slug}`}
            className="flex items-center gap-8 rounded-xl p-5 border-1"
          >
            <div className="w-[150px] h-[100px] relative flex-shrink-0">
              <Image
                src={nextBlog.image || "/fallback.jpg"}
                alt={nextBlog.title}
                fill
                className="rounded-xl object-cover"
              />
            </div>
            <div className="space-y-3">
              <h2 className="text-white font-extrabold text-xl">
                {nextBlog.title}
              </h2>
              <p className="text-gray-400 font-extrabold text-md line-clamp-2">
                {nextBlog.description}
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

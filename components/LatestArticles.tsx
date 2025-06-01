// components/LatestArticles.tsx
import { getAllBlogs } from "@/lib/blogService";
import Image from "next/image";
import Link from "next/link";

export default async function LatestArticles() {
  const blogs = await getAllBlogs();

  return (
    <div className="my-10 px-5 w-full border-b pb-7">
      <h1 className="font-bold text-md px-4 mb-5 uppercase tracking-wider">
        Latest Articles
      </h1>

      <div className="space-y-14">
        {blogs.map((blog) => (
          <Link
            href={`/blog/${blog.id}`}
            key={blog.id}
            className="grid lg:grid-cols-2 gap-10 group"
          >
            {/* Desktop Image */}
            <div className="hidden lg:block">
              <Image
                src={blog.image.trimEnd() || "/fallback.jpg"}
                alt={blog.title}
                width={430}
                height={250}
                className="rounded-2xl object-cover w-full h-[250px]"
              />
            </div>

            {/* Mobile/Tablet Image */}
            <div className="w-full h-[200px] md:h-[400px] relative lg:hidden">
              <Image
                src={blog.image.trimEnd() || "/fallback.jpg"}
                alt={blog.title}
                fill
                className="rounded-2xl object-cover"
              />
            </div>

            {/* Text Content */}
            <div>
              <h2 className="mt-5 mb-3 text-2xl md:text-3xl font-extrabold capitalize">
                {blog.title}
              </h2>
              <div className="flex items-center gap-3 mb-5 text-sm text-gray-500">
                <span>{blog.author}</span>
                <span>|</span>
                <span>{new Date(blog.createdAt).toDateString()}</span>
              </div>
              <p className="text-lg text-gray-400 font-medium line-clamp-2">
                {blog.description}
              </p>
              <span className="inline-block mt-4 bg-secondary rounded-full px-4 py-1.5 text-sm font-bold text-gray-300 capitalize">
                {blog.category}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

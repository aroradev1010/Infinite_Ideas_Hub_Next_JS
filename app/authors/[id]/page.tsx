// app/authors/[id]/page.tsx
import SecondaryButton from "@/components/SecondaryButton";
import StarBackground from "@/components/StarBackground";
import { getAuthorById } from "@/lib/authorService";
import { getBlogsByAuthor } from "@/lib/blogService";
import Image from "next/image";
import Link from "next/link";
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
    <div className="max-w-5xl mx-auto px-4 ">
      {/* ─── Author Header ───────────────────────────────────────────────────────── */}
      {/* <div className="flex flex-col items-center text-center mb-12">
        <div className="w-32 h-32 relative mb-4">
          <Image
            src={author.profileImage || "/fallback-avatar.png"}
            alt={author.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold capitalize mb-2">{author.name}</h1>
        <p className="text-gray-600 mb-2 line-clamp-3">{author.bio}</p>
        <span className="text-sm text-gray-400">
          Joined {new Date(author.createdAt).toDateString()}
        </span>
      </div> */}
      <div className="h-96">
        <StarBackground
          imageSrc={author.profileImage || "/fallback.avif"}
          text={author.name}
          imageClassName="rounded-full h-[100px] w-[100px] mb-2"
        />
      </div>

      {/* ─── Author’s Blogs List ─────────────────────────────────────────────────── */}

      <div className="space-y-12">
        {blogs.map((blog) => (
          <Link
            href={`/blog/${blog.id}`}
            key={blog.id}
            className="grid xl:grid-cols-3 group gap-5 border-b pb-5"
          >
            {/* Desktop Image */}
            <div className="hidden xl:flex justify-center">
              <Image
                src={blog.image.trimEnd() || "/fallback.avif"}
                alt={blog.title}
                width={180}
                height={180}
                className="rounded-full object-cover w-[180px] h-[180px]"
              />
            </div>

            {/* Mobile/Tablet Image */}
            <div className="w-full h-[200px] md:h-[400px] relative xl:hidden">
              <Image
                src={blog.image.trimEnd() || "/fallback.avif"}
                alt={blog.title}
                fill
                className="rounded-2xl object-cover"
              />
            </div>

            {/* Text Content */}
            <div className="xl:col-span-2 xl:space-y-3 space-y-5">
              <h2 className=" text-2xl md:text-3xl font-extrabold capitalize">
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
              <SecondaryButton text={blog.category} />
            </div>
          </Link>
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

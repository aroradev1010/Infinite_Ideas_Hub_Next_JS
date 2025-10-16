import { getBlogBySlug, getNextOrOldestBlog } from "@/lib/blogService";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import { cn, formatDate, slugify } from "@/lib/utils";

import { authOptions } from "@/lib/auth"; // adjust path as needed
import { getServerSession } from "next-auth";
import PrimaryButton from "@/components/PrimaryButton";

// Define the Props interface with explicit params type
interface Props {
  params: Promise<{ slug: string }>; // Use Promise to match Next.js expectation
}

export default async function BlogPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return notFound();

  // 🧠 Check if the blog is a draft
  const isDraft = blog.status !== "published";
  const isAdmin = session?.user?.role === "admin";

  // ✅ If blog is draft and user is not admin, block access
  if (isDraft && !isAdmin) {
    return notFound();
  }

  const nextBlog = await getNextOrOldestBlog(new Date(blog.createdAt));
  const blogId = blog.id.toString();




  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-3 text-md font-bold tracking-wider flex w-full justify-between">
        <div>
          <Link href={`/authors/${slugify(blog.author)}`}>
            <span className="capitalize text-gray-400 hover:text-primary">
              By {blog.author}
            </span>
          </Link>
          <Link href={`/blog/${blog.slug}`} key={blog.id}>
            <span className="text-gray-700 mx-3">/</span>
            <span className="text-gray-400">{formatDate(blog.createdAt)}</span>
          </Link>
        </div>
        <div className="hidden md:flex">
          <LikeButton slug={blog.slug} initialLikes={blog.likes || 0} />
        </div>
      </div>
      <h1 className="text-4xl font-bold my-5 capitalize tracking-wide leading-14">
        {blog.title}
        {blog.status === "draft" && (
          <p className="text-sm text-yellow-500 font-semibold">
            [Draft - Not Published]
          </p>
        )}
      </h1>
      <Image
        src={blog.image.trimEnd() || "/fallback.avif"}
        alt={blog.title}
        width={800}
        height={800}
        className="rounded-xl object-cover w-full h-[500px] mb-8"
      />

      <div className="relative">
        <div
          className={cn(
            "tracking-wide blogDescription transition-all duration-300",
            !session && "line-clamp-10"
          )}
          dangerouslySetInnerHTML={{ __html: blog.description }}
        ></div>

        {!session && (
          <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-background to-transparent flex items-end justify-center pointer-events-none">
            <div className="pointer-events-auto mb-4">
              <Link href="/auth/sign-in">
                <PrimaryButton
                  text=" Sign Up to Read More
                "
                  className="text-lg mb-10"
                />

              </Link>
            </div>
          </div>
        )}
      </div>

      {nextBlog && (
        <div className="my-20">
          <h1 className="font-bold text-md px-4 mb-5 uppercase tracking-wider">
            Next Article
          </h1>
          <Link
            href={`/blog/${nextBlog.slug}`}
            className="flex items-start gap-8 flex-col md:flex-row rounded-xl p-5 border-1"
          >
            <div className="w-[150px] h-[100px] relative flex-shrink-0">
              <Image
                src={nextBlog.image || "/fallback.jpg"}
                alt={nextBlog.title}
                fill
                className="rounded-xl object-cover"
              />
            </div>
            <div className="space-y-3 overflow-hidden">
              <h2 className="text-white font-extrabold text-xl">
                {nextBlog.title}
              </h2>
              <div
                className="tracking-wide line-clamp-3 text-gray-400 mb-5 blogDescription"
                dangerouslySetInnerHTML={{
                  __html: nextBlog && nextBlog.description,
                }}
              ></div>
            </div>
          </Link>
        </div>
      )}
      <CommentSection blogId={blogId} />
    </div>
  );
}

// // Optional: Define generateStaticParams for static generation
// export async function generateStaticParams() {
//   const blogs = await getAllBlogSlugs(); // Hypothetical function to fetch all slugs
//   return blogs.map((blog) => ({
//     slug: blog.slug,
//   }));
// }

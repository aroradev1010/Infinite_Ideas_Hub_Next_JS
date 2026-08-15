import BlogArticle from "@/components/blog/BlogArticle"
import CommentSection from "@/components/CommentSection"
import LikeButton from "@/components/LikeButton"
import PrimaryButton from "@/components/PrimaryButton"
import { authOptions } from "@/lib/auth"
import {
  getBlogBySlug,
  getNextOrOldestBlog,
} from "@/lib/blogService.server"
import { slugify } from "@/lib/utils"
import { getServerSession } from "next-auth"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPage({ params }: BlogPageProps) {
  const sessionPromise = getServerSession(authOptions)
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog) notFound()

  const [session, nextBlog] = await Promise.all([
    sessionPromise,
    getNextOrOldestBlog(new Date(blog.publishedAt)),
  ])

  const contentOverlay = !session ? (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex h-56 items-end justify-center bg-linear-to-t from-background to-transparent">
      <div className="pointer-events-auto mb-4">
        <Link href="/auth/sign-in">
          <PrimaryButton
            text="Sign Up to Read More"
            className="mb-10 text-lg"
          />
        </Link>
      </div>
    </div>
  ) : null

  return (
    <>
      <BlogArticle
        article={blog}
        articleHref={`/blog/${blog.slug}`}
        authorHref={`/authors/${blog.authorSlug ?? slugify(blog.author)}`}
        categoryHref={`/categories/${slugify(blog.category || "uncategorized")}`}
        contentClassName={!session ? "line-clamp-10" : undefined}
        contentOverlay={contentOverlay}
        metadataActions={
          <LikeButton slug={blog.slug} initialLikes={blog.likes} />
        }
      />

      <div className="mx-auto max-w-4xl px-4 pb-10">
        {nextBlog ? (
          <div className="my-20">
            <h2 className="mb-5 px-4 text-md font-bold tracking-wider uppercase">
              Next Article
            </h2>
            <Link
              href={`/blog/${nextBlog.slug}`}
              className="flex flex-col items-start gap-8 rounded-xl border p-5 md:flex-row"
            >
              <div className="relative h-25 w-37.5 shrink-0">
                <Image
                  src={nextBlog.image || "/fallback.avif"}
                  alt={nextBlog.title}
                  fill
                  sizes="150px"
                  className="rounded-xl object-cover"
                />
              </div>
              <div className="space-y-3 overflow-hidden">
                <h3 className="text-xl font-extrabold text-white">
                  {nextBlog.title}
                </h3>
                <div
                  className="blogDescription mb-5 line-clamp-3 tracking-wide text-gray-400"
                  dangerouslySetInnerHTML={{ __html: nextBlog.contentHtml }}
                />
              </div>
            </Link>
          </div>
        ) : null}

        <CommentSection blogId={blog.id} />
      </div>
    </>
  )
}

import Link from "next/link"
import type { ReactNode } from "react"

import { cn, formatDate } from "@/lib/utils"
import type { BlogArticleData } from "@/types/blogType"

interface BlogArticleProps {
  article: BlogArticleData
  articleHref?: string
  authorHref?: string
  categoryHref?: string
  contentClassName?: string
  contentOverlay?: ReactNode
  metadataActions?: ReactNode
}

function MetadataValue({
  children,
  href,
}: {
  children: ReactNode
  href?: string
}) {
  return href ? (
    <Link href={href} className="text-gray-400 hover:text-primary">
      {children}
    </Link>
  ) : (
    <span className="text-gray-400">{children}</span>
  )
}

export default function BlogArticle({
  article,
  articleHref,
  authorHref,
  categoryHref,
  contentClassName,
  contentOverlay,
  metadataActions,
}: BlogArticleProps) {
  const coverImage = article.image.trim() || "/fallback.avif"

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-3 flex w-full justify-between text-md font-bold tracking-wider">
        <div>
          <MetadataValue href={authorHref}>
            <span className="capitalize">By {article.author}</span>
          </MetadataValue>
          <span className="mx-3 text-gray-700">/</span>
          <MetadataValue href={articleHref}>
            {formatDate(article.publishedAt)}
          </MetadataValue>
          {article.category ? (
            <>
              <span className="mx-3 text-gray-700">/</span>
              <MetadataValue href={categoryHref}>
                {article.category}
              </MetadataValue>
            </>
          ) : null}
        </div>
        {metadataActions ? (
          <div className="hidden md:flex">{metadataActions}</div>
        ) : null}
      </header>

      <h1 className="my-5 text-4xl font-bold leading-14 capitalize tracking-wide">
        {article.title}
      </h1>

      {/* Native img supports arbitrary validated HTTP(S), relative, and data URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverImage}
        alt={article.title}
        width={800}
        height={800}
        className="mb-8 h-125 w-full rounded-xl object-cover"
      />

      <div className="relative">
        <div
          className={cn(
            "blogDescription tracking-wide transition-all duration-300",
            contentClassName
          )}
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
        {contentOverlay}
      </div>
    </article>
  )
}

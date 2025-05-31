"use client";

import { Blog } from "@/types/blogType";
import Image from "next/image";
import Link from "next/link";

interface Props {
  article: Blog;
}

const FeaturedArticle: React.FC<Props> = ({ article }) => {
  return (
    <Link
      href={`/blog/${article.id}`}
      passHref
      className="block hover:opacity-90 transition-opacity duration-300"
    >
      <div className="my-10 px-5 w-full border-b pb-7">
        <h1 className="font-bold text-md px-4 mb-5 uppercase tracking-wider">
          Featured Article
        </h1>
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="hidden lg:block">
            <Image
              src={article.image.trimEnd() || "/fallback.jpg"}
              alt={article.title}
              width={430}
              height={250}
              className="rounded-2xl object-cover w-full h-[250px]"
            />
          </div>

          {/* Image for small to md screens */}
          <div className="w-full h-[200px] md:h-[400px] relative lg:hidden">
            <Image
              src={article.image.trimEnd() || "/fallback.jpg"}
              alt={article.title}
              className="rounded-2xl object-cover"
              fill
            />
          </div>
          <div>
            <h1 className="mt-5 mb-3 text-2xl md:text-3xl lg:text-3xl font-extrabold capitalize">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 mb-5">
              <span className="capitalize">{article.author}</span>
              <span>|</span>
              <span className="font-extralight">
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xl font-medium text-gray-400 line-clamp-2">
              {article.description}
            </p>
            <button className="mt-4 bg-secondary rounded-full px-4 py-2 font-extrabold tracking-wider text-gray-300 capitalize">
              {article.category}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedArticle;

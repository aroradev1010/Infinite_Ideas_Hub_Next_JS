"use client";

import { Blog } from "@/types/blogType";
import Image from "next/image";
import Link from "next/link";
import SecondaryButton from "./SecondaryButton";

interface Props {
  blog: Blog;
}

const Featuredblog: React.FC<Props> = ({ blog }) => {
  return (
    <Link href={`/blog/${blog.id}`} passHref>
      <div className="my-10 w-full border-b pb-7 px-10 xl:px-0">
        <h1 className="font-bold text-md px-4 mb-5 uppercase tracking-wider">
          Featured blog
        </h1>
        <div className="grid xl:grid-cols-5 gap-10 ">
          <div className="hidden xl:block col-span-2">
            <Image
              src={blog.image.trimEnd() || "/fallback.avif"}
              alt={blog.title}
              width={430}
              height={250}
              className="rounded-2xl object-cover w-full h-[300px]"
            />
          </div>

          {/* Image for small to md screens */}
          <div className="w-full h-[200px] md:h-[400px] relative xl:hidden">
            <Image
              src={blog.image.trimEnd() || "/fallback.avif"}
              alt={blog.title}
              className="rounded-2xl object-cover"
              fill
            />
          </div>
          <div className="space-y-5 xl:col-span-3">
            <h1 className="text-2xl md:text-3xl xl:text-3xl font-extrabold capitalize">
              {blog.title}
            </h1>
            <div className="flex items-center gap-3 mb-5 text-md font-bold tracking-wider">
              <span className="capitalize text-gray-400">By {blog.author}</span>
              <span className="text-gray-700">/</span>
              <span className="text-gray-400">
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-xl font-medium text-gray-400 line-clamp-2">
              {blog.description}
            </p>

            <Link href={`/categories/${blog.category.toLowerCase()}`}>
              <SecondaryButton>{blog.category}</SecondaryButton>
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Featuredblog;

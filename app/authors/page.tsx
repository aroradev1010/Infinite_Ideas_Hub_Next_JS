import StarBackground from "@/components/StarBackground";
import { getAllAuthors } from "@/lib/authorService";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = async () => {
  const authors = await getAllAuthors();
  return (
    <div className="h-screen">
      <div className="h-96">
        <StarBackground
          imageSrc="/authorsPage.webp"
          text=""
          imageClassName="rounded-full h-[150px] w-[150px] mb-2"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4  py-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 perspective-[1200px]">
          {authors.map((author) => (
            <Link
              key={author.id}
              href={`/authors/${author.slug}`}
              className="relative group xl:w-[400px] cursor-pointer"
            >
              {/* ─── Card ───────────────────── */}
              <div
                className="
            relative
            flex flex-col
            p-8
            rounded-2xl
            bg-transparent
            border border-white/10
            transform-gpu
            transition-transform duration-500
            group-hover:rotate-x-3 group-hover:-rotate-y-6 group-hover:scale-[1.03]
          "
              >
                <div className="w-[80px] h-[80px] mb-4 relative flex-shrink-0">
                  <Image
                    src={author.profileImage || "/fallback-avatar.png"}
                    alt={author.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-semibold text-white capitalize">
                  {author.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;

import StarBackground from "@/components/StarBackground";
import { getAllAuthors } from "@/lib/authorService";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = async () => {
  const authors = await getAllAuthors();
  return (
    <div>
      <div className="h-96">
        <StarBackground
          imageSrc="/fallback.jpg"
          text="Authors"
          imageClassName="rounded-full h-[100px] w-[100px] mb-2"
        />
      </div>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">All Authors</h1>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {authors.map((author) => (
            <Link
              key={author.id}
              href={`/authors/${author.id}`}
              className="flex flex-col items-center text-center p-4 border rounded-2xl hover:shadow-lg transition"
            >
              <div className="w-32 h-32 mb-4 relative">
                <Image
                  src={author.profileImage || "/fallback.jpgw"}
                  alt={author.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold capitalize">
                {author.name}
              </h2>
              <p className="mt-2 text-gray-500 line-clamp-2">{author.bio}</p>
              <span className="mt-2 text-sm text-gray-400">
                Joined {new Date(author.createdAt).toDateString()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;

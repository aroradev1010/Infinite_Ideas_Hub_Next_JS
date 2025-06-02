// app/categories/page.tsx

import StarBackground from "@/components/StarBackground";
import { getAllCategories } from "@/lib/categoryService";
import Link from "next/link";
import React from "react";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="my-20">
      {/* ─── Header / Hero Section ───────────────────────────────────────────── */}
      <div className="h-96">
        <StarBackground
          imageSrc="/fallback.avif"
          text="Categories"
          imageClassName="rounded-full h-[100px] w-[100px] mb-2"
        />
      </div>

      {/* ─── Categories Grid ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 perspective-[1200px]">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="relative group xl:w-[400px] cursor-pointer"
            >
              {/* ─── Card ───────────────────────────────────────────────────────── */}
              <div
                className="
                  relative
                  flex flex-col items-center text-center
                  p-8
                  rounded-2xl
                  bg-transparent
                  border border-white/10
                  transform-gpu
                  transition-transform duration-500
                  group-hover:rotate-x-3
                  group-hover:-rotate-y-6
                  group-hover:scale-[1.07]
                "
              >
                <h2 className="text-2xl font-semibold text-white capitalize mb-2">
                  {cat.name}
                </h2>
                {/* {cat.description && (
                  <p className="text-gray-400">{cat.description}</p>
                )} */}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

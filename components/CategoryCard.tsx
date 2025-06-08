// components/CategoryCard.tsx
import Link from "next/link";
import { Category } from "@/types/categoryType";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <div className="group w-[300px] md:w-[400px] cursor-pointer">
        <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-transparent transform-gpu transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
          <h2 className="text-2xl font-semibold text-white capitalize mb-2">
            {category.name}
          </h2>
        </div>
      </div>
    </Link>
  );
}

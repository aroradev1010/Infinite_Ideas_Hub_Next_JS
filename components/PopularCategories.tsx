import { BLOG_CATEGORIES } from "@/lib/blogCategories"
import Image from "next/image"
import Link from "next/link"

const PopularCategories = () => {
  const topCategories = BLOG_CATEGORIES.slice(0, 6)

  return (
    <div className="mt-10">
      <h1 className="font-bold text-md  mb-5 uppercase tracking-wider">
        Popular Categories
      </h1>
      <div className="space-y-4">
        {topCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity"
          >
            <Image
              src={category.image}
              alt={category.name}
              width={36}
              height={36}
              className="rounded-full object-cover w-10 h-10"
            />
            <span className="text-white font-semibold tracking-wider text-lg">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default PopularCategories

// app/page.tsx
import StarBackground from "@/components/StarBackground";
import FeaturedArticle from "@/components/FeaturedArticle";
import { getFeaturedBlog } from "@/lib/blogService";
import LatestArticles from "@/components/LatestArticles";
import SubscribeButton from "@/components/SubscribeButton";
import PopularCategories from "@/components/PopularCategories";

export default async function Home() {
  const featuredBlog = await getFeaturedBlog();

  return (
    <div>
      <div className="h-96">
        <StarBackground
          imageSrc="/headerImage.png"
          text="Thoughts, stories and ideas."
        />
      </div>
      <div className="max-w-7xl mx-auto xl:px-10">
        {featuredBlog ? (
          <FeaturedArticle blog={featuredBlog} />
        ) : (
          <p className="text-center py-10 text-gray-500">No article found.</p>
        )}
      </div>
      <div className="max-w-7xl mx-auto xl:px-10">
        <div className="xl:grid xl:grid-cols-3 xl:gap-4">
          <div className="xl:col-span-2">
            <LatestArticles />
          </div>

          {/* Sticky subscribe button on the right */}
          <div className="hidden xl:block col-span-1">
            <div className="sticky top-10 ml-20">
              <SubscribeButton />
              <PopularCategories />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

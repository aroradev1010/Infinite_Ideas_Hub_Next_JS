// app/page.tsx
import Header from "@/components/Header";
import FeaturedArticle from "@/components/FeaturedArticle";
import { getFeaturedBlog } from "@/lib/blogService";
import LatestArticles from "@/components/LatestArticles";
import SubscribeButton from "@/components/SubscribeButton";

export default async function Home() {
  const featuredBlog = await getFeaturedBlog();

  return (
    <div>
      <div className="h-96">
        <Header />
      </div>
      <div className="lg:mx-auto lg:w-4/5 xl:w-5/6">
        {featuredBlog ? (
          <FeaturedArticle blog={featuredBlog} />
        ) : (
          <p className="text-center py-10 text-gray-500">No article found.</p>
        )}
      </div>
      <div className="lg:mx-auto lg:w-4/5 xl:w-5/6">
        <div className="xl:grid xl:grid-cols-3 xl:gap-4">
          <div className="xl:col-span-2">
            <LatestArticles />
          </div>
          <div className="hidden lg:block col-span-1">
            <SubscribeButton />
          </div>
        </div>
      </div>
    </div>
  );
}

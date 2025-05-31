import FeaturedArticle from "@/components/FeaturedArticle";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="">
      <div className="h-96">
        <Header />
      </div>
      <div className="lg:mx-auto lg:w-3/5">
        <FeaturedArticle />
      </div>
    </div>
  );
}

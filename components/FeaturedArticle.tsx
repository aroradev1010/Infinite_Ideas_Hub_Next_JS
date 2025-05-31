import Image from "next/image";
import React from "react";

const FeaturedArticle = () => {
  return (
    <div className="my-10 px-5 max-w-screen w-full border-b pb-7">
      <h1 className="font-bold text-md px-4 mb-5 uppercase tracking-wider">
        Featured Article
      </h1>
      <div className="relative w-full h-[500px]">
        <Image
          src="/featuredArticle.avif"
          alt="Featured Article Image"
          className="rounded-2xl"
          fill
        />
      </div>
      <h1 className="mt-5 mb-3 text-3xl font-bold">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Debitis, vero?
      </h1>
      <span className="font-extralight">27 Sept 2025</span>
    </div>
  );
};

export default FeaturedArticle;

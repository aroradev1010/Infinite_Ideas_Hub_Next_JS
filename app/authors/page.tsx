import StarBackground from "@/components/StarBackground";
import React from "react";

const page = () => {
  return (
    <div>
      <div className="h-96">
        <StarBackground
          imageSrc="/fallback.jpg"
          text="Authors"
          imageClassName="rounded-full h-[100px] w-[100px] mb-2"
        />
      </div>
    </div>
  );
};

export default page;

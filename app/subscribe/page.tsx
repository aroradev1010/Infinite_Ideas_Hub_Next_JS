// app/subscribe/page.tsx
import Image from "next/image";
import SubscribeButton from "@/components/SubscribeButton";

export default function SubscribePage() {
  return (
    <div className="max-w-7xl mx-auto xl:px-10">
      {/* 1. Giant Heading at the top */}
      <div>
        <h1 className="md:text-5xl text-2xl font-extrabold text-center mt-16 md:mb-8 mb-4">
          Join Our Newsletter
        </h1>
        <p className="text-center md:text-2xl md:text-white mb-12 px-10 md:px-0 text-gray-400">
          Stay ahead with exclusive insights and updates—delivered straight to
          your inbox. <br /> Subscribe now!
        </p>
      </div>
      {/* 2. Image section with overlay */}
      <div className="relative w-full h-[400px] lg:h-[600px] overflow-hidden ">
        {/* Background Image */}
        <Image
          src="/subscribePage2.webp" // replace with your actual background image
          alt="Subscribe Background"
          fill
          className="object-cover rounded-xl"
        />

        {/* Gradient Overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t  from-black via-black/90 to-black/90" />

        {/* 3. Centered Subscribe Button Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pb-20 md:pb-0">
          <div className="max-w-2xl w-full mb-30">
            <SubscribeButton
              classNameHeading="md:text-4xl text-xl w-5/6 text-center leading-snug tracking-wider text-white mb-6"
              classNameLayout="flex flex-col justify-center items-center"
              classNameInput="max-w-full w-full tracking-wider bg-black/80"
              classNameParagraph="text-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

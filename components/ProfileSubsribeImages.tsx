import Image from "next/image";
import React from "react";
import SecondaryButton from "./SecondaryButton";

const ProfileSubsribeImages = () => {
  return (
    <div className="flex items-center gap-2 ">
      <div className="flex -space-x-4 ">
        <Image
          src={"/fallback.avif"}
          alt=""
          width={50}
          height={50}
          className="rounded-full w-[50px] h-[50px] object-cover"
        />
        <Image
          src={"/fallback.avif"}
          alt=""
          width={50}
          height={50}
          className="rounded-full w-[50px] h-[50px] object-cover"
        />
        <Image
          src={"/fallback.avif"}
          alt=""
          width={50}
          height={50}
          className="rounded-full w-[50px] h-[50px] object-cover"
        />
        <Image
          src={"/fallback.avif"}
          alt=""
          width={50}
          height={50}
          className="rounded-full w-[50px] h-[50px] object-cover"
        />
      </div>
      <SecondaryButton>1.4K+</SecondaryButton>
    </div>
  );
};

export default ProfileSubsribeImages;

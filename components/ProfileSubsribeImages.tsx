import Image from "next/image";
import React from "react";
import SecondaryButton from "./SecondaryButton";

const ProfileSubsribeImages = () => {
  return (
    <div className="flex items-center gap-2 ">
      <div className="flex -space-x-4 ">
        <Image
          src={"/profileSubscribeAvatarImage1.webp"}
          alt=""
          width={50}
          height={50}
          className="rounded-full md:w-[50px] md:h-[50px] h-[30px] w-[30px] object-cover"
        />
        <Image
          src={"/profileSubscribeAvatarImage2.webp"}
          alt=""
          width={50}
          height={50}
          className="rounded-full md:w-[50px] md:h-[50px] object-cover h-[30px] w-[30px]"
        />
        <Image
          src={"/profileSubscribeAvatarImage3.webp"}
          alt=""
          width={50}
          height={50}
          className="rounded-full md:w-[50px] md:h-[50px] object-cover h-[30px] w-[30px]"
        />
        <Image
          src={"/profileSubscribeAvatarImage4.webp"}
          alt=""
          width={50}
          height={50}
          className="rounded-full md:w-[50px] md:h-[50px] object-cover h-[30px] w-[30px]"
        />
      </div>
      <SecondaryButton>1.4K+</SecondaryButton>
    </div>
  );
};

export default ProfileSubsribeImages;

import Image from "next/image";
import React from "react";
import SecondaryButton from "./SecondaryButton";

const ProfileSubsribeImages = () => {
  return (
    <div className="flex items-center gap-2 ">
      <Image
        src={"/fallback.jpg"}
        alt=""
        width={50}
        height={50}
        className="rounded-full w-[50px] h-[50px] object-cover"
      />
      <Image
        src={"/fallback.jpg"}
        alt=""
        width={50}
        height={50}
        className="rounded-full w-[50px] h-[50px] object-cover"
      />
      <Image
        src={"/fallback.jpg"}
        alt=""
        width={50}
        height={50}
        className="rounded-full w-[50px] h-[50px] object-cover"
      />
      <Image
        src={"/fallback.jpg"}
        alt=""
        width={50}
        height={50}
        className="rounded-full w-[50px] h-[50px] object-cover"
      />
      <SecondaryButton text="1.4K+" />
    </div>
  );
};

export default ProfileSubsribeImages;

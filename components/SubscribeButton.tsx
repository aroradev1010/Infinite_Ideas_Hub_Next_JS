import React from "react";
import ProfileSubsribeImages from "./ProfileSubsribeImages";
import { Input } from "./ui/input";
import PrimaryButton from "./PrimaryButton";
import { cn } from "@/lib/utils";

const SubscribeButton = ({
  classNameLayout,
  classNameHeading,
  classNameParagraph,
  classNameInput,
}: {
  classNameLayout?: string;
  classNameInput?: string;
  classNameParagraph?: string;
  classNameHeading?: string;
}) => {
  return (
    <div className={cn(`my-10 space-y-5`, classNameLayout)}>
      <ProfileSubsribeImages />
      <h1
        className={cn(`font-extrabold mb-5 tracking-wider`, classNameHeading)}
      >
        Get exclusive tips and updates delivered weekly to your inbox.
      </h1>
      <div className={cn(`flex max-w-sm items-center gap-2`, classNameInput)}>
        <Input type="email" placeholder="Email" />
        <PrimaryButton text="Subscribe" type="submit" className="" />
      </div>
      <p className={cn(`text-sm font-bold`, classNameParagraph)}>
        No spam emails. Just valuable content.
      </p>
    </div>
  );
};

export default SubscribeButton;

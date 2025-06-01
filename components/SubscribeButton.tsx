import React from "react";
import ProfileSubsribeImages from "./ProfileSubsribeImages";
import { Input } from "./ui/input";
import PrimaryButton from "./PrimaryButton";

const SubscribeButton = () => {
  return (
    <div className="my-10">
      <div className="space-y-5">
        <ProfileSubsribeImages />
        <h1 className="font-extrabold text-xl mb-5  tracking-wider">
          Get exclusive tips and updates delivered weekly to your inbox.
        </h1>
        <div className="flex w-4/5 max-w-sm items-center gap-2">
          <Input type="email" placeholder="Email" />
          <PrimaryButton
            text="Subscribe"
            type="submit"
            className="rounded-lg"
          />
        </div>
        <p className="text-sm font-bold">
          No spam emails. Just valuable content.
        </p>
      </div>
    </div>
  );
};

export default SubscribeButton;

import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const PrimaryButton = ({ className }: { className?: string }) => {
  return (
    <Button
      className={cn(
        `${className}`,
        "text-white font-semibold rounded-full cursor-pointer"
      )}
    >
      Subscribe
    </Button>
  );
};

export default PrimaryButton;

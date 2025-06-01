import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const PrimaryButton = ({
  className,
  text,
  type,
}: {
  className?: string;
  text: string;
  type?: string;
}) => {
  return (
    <Button
      className={cn(
        `${className}`,
        "text-white  cursor-pointer font-extrabold"
      )}
    >
      {text}
    </Button>
  );
};

export default PrimaryButton;

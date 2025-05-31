import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const PrimaryButton = ({
  className,
  text,
}: {
  className?: string;
  text: string;
}) => {
  return (
    <Button
      className={cn(`${className}`, "text-white rounded-full cursor-pointer")}
    >
      {text}
    </Button>
  );
};

export default PrimaryButton;

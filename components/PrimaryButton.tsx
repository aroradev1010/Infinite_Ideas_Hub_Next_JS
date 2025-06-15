import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const PrimaryButton = ({
  className,
  text,
  onClick,
}: {
  className?: string;
  text: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <Button
      className={cn(`${className}`, "text-white cursor-pointer font-extrabold")}
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

export default PrimaryButton;

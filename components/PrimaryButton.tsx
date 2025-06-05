import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const PrimaryButton = ({
  className,
  text,
  type,
  onClick,
}: {
  className?: string;
  text: string;
  type?: string;
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

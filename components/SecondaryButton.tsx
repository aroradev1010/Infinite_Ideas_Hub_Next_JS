import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "./ui/button";

interface SecondaryButtonProps {
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
  children: React.ReactNode;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  className,
  type = "button",
  onClick,
  "aria-label": ariaLabel,
  children,
}) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        `bg-secondary rounded-full px-4 py-2 font-extrabold tracking-wider text-gray-300 capitalize`,
        className
      )}
    >
      {children}
    </Button>
  );
};

export default SecondaryButton;

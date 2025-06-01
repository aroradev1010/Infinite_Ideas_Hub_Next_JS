import { cn } from "@/lib/utils";
import React from "react";

const SecondaryButton = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return (
    <button
      className={cn(
        `bg-secondary rounded-full px-4 py-2 font-extrabold tracking-wider text-gray-300 capitalize`,
        className
      )}
    >
      {text}
    </button>
  );
};

export default SecondaryButton;

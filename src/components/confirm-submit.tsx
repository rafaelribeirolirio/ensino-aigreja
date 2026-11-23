"use client";

import type { ReactNode } from "react";

import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmSubmitProps = {
  children: ReactNode;
  message: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
};

export function ConfirmSubmit({
  children,
  message,
  variant = "destructive",
  size = "sm",
  className,
}: ConfirmSubmitProps) {
  return (
    <button
      type="submit"
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}

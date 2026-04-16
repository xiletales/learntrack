"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-green-700 text-white hover:bg-green-800",
  outline:
    "bg-transparent text-green-700 border-[1.5px] border-green-700 hover:bg-green-50",
  danger:
    "bg-red-400 text-white hover:bg-red-500",
  ghost:
    "bg-transparent text-gray-500 hover:bg-gray-100 px-2.5 py-1.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-none disabled:opacity-60 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

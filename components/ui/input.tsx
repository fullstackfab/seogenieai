"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
};

export function Input({ wrapperClassName, className, ...rest }: InputProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <input
        {...rest}
        className={cn(
          "w-full rounded-[9px] border border-gray-300 px-4 py-2 text-base text-[#171717] outline-none transition-colors duration-200 focus:border-dark-100 focus:ring-4 focus:ring-dark-100/10 disabled:opacity-50",
          className
        )}
      />
    </div>
  );
}

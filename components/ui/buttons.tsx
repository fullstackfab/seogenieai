import link from "next/link";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const BASE =
  "pt-[7px] pb-2 px-[21px] text-center inline-block text-base leading-[21.28px] font-normal rounded-[9px] border border-dark-100 transition-colors duration-300";
const SOLID = "bg-dark-100 text-white hover:bg-transparent hover:text-dark-100";
const OUTLINED = "text-dark-100 border-dark-100 hover:bg-dark-100 hover:text-white";

type Variant = "solid" | "outlined";

export function LinkButton({
  to,
  children,
  className,
  variant = "solid",
}: {
  to: string;
  children: ReactNode;
  className?: string;
  variant?: Variant;
}) {
  return (
    <Link
      href={to}
      className={`${BASE} ${variant === "outlined" ? OUTLINED : SOLID} ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  className,
  variant = "solid",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      className={`${BASE} ${variant === "outlined" ? OUTLINED : SOLID} disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function BackToHome({ link, heading }: { link?: string; heading?: string }) {
  return (
    <Link href={link ?? "/"} className="text-base uppercase font-semibold mb-6 inline-block">
      ← {heading ?? "Back to home"}
    </Link>
  );
}

export function BackToHomeClick({
  onclick,
  heading,
  icon = "←",
  className,
}: {
  onclick?: () => void;
  heading?: string;
  icon?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onclick}
      className={className ?? "text-base cursor-pointer uppercase font-semibold mb-6 inline-block"}
    >
      {icon} {heading ?? "Back to home"}
    </button>
  );
}

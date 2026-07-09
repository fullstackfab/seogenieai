import type { ReactNode } from "react";

type TypographyProps = {
  /** "tag" renders the semantic heading element; anything else renders a styled div. */
  as?: "tag" | "div";
  children?: ReactNode;
  className?: string;
};

function heading(Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6", tagClass: string, divClass: string) {
  return function Heading({ as, children, className }: TypographyProps) {
    const cls = `${className ?? ""} ${as === "tag" ? tagClass : divClass}`;
    if (as === "tag") return <Tag className={cls}>{children}</Tag>;
    return <div className={cls}>{children}</div>;
  };
}

export const H1 = heading(
  "h1",
  "text-[32px] font-normal leading-[42.56px] tracking-normal",
  "text-[22px] font-normal leading-[29.08px] tracking-[-0.01em]"
);
export const H2 = heading(
  "h2",
  "text-[22px] font-bold leading-[29.08px] tracking-[-0.01em]",
  "text-[22px] font-bold leading-[29.08px] tracking-[-0.01em]"
);
export const H3 = heading(
  "h3",
  "text-[19px] font-medium leading-[25.88px] tracking-[-0.01em]",
  "text-[20px] font-semibold leading-[26.44px] tracking-[-0.01em]"
);
export const H4 = heading(
  "h4",
  "text-[16px] text-[#2A2C29] leading-[28px] tracking-[0.01em]",
  "text-[16px] font-semibold leading-[17.29px] tracking-normal"
);
export const H5 = heading(
  "h5",
  "text-[14px] font-semibold leading-[24px]",
  "text-[14px] font-semibold leading-[24px]"
);
export const H6 = heading(
  "h6",
  "text-[13px] text-[#2A2C29] font-normal leading-[18.2px]",
  "text-[13px] font-normal leading-[18.2px]"
);

export function Text({ children, className }: TypographyProps) {
  return (
    <p
      className={`${className ?? ""} text-[14px] font-normal leading-normal antialiased tracking-[0.02em]`}
    >
      {children}
    </p>
  );
}

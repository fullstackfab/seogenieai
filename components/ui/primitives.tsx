import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

type BoxProps = {
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: CSSProperties;
};

/** Page-width container (ported from the legacy client). */
export function Container({ className, children }: BoxProps) {
  return (
    <div
      className={`${className ?? ""} max-w-[1830px] w-full px-[75px] max-xl:px-[50px] max-sm-tab:px-4 mx-auto`}
    >
      {children}
    </div>
  );
}

/** Generic div wrapper kept for markup parity with the legacy client. */
export function Wrapper({ className, children, onClick, style }: BoxProps) {
  return (
    <div onClick={onClick} className={className} style={style}>
      {children}
    </div>
  );
}

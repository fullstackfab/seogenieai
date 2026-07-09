"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/navigation";

export function NavHorizontal({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center flex-wrap gap-[50px] max-3xl:gap-x-[0px] max-3xl:justify-between max-3xl:px-[150px] max-lg:px-[50px] w-full justify-center">
        {items.map((item) => (
          <li key={item.link}>
            <Link
              className={`text-base font-semibold leading-[21.28px] antialiased text-black ${
                item.link === path ? "border-b border-dark-100" : ""
              }`}
              href={item.link}
              aria-current={item.link === path ? "page" : undefined}
              aria-label={item.label}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import { twMerge } from "tailwind-merge";

/** Merges Tailwind class strings, letting later classes correctly override earlier ones. */
export function cn(...classes: Array<string | undefined | null | false>): string {
  return twMerge(classes.filter(Boolean).join(" "));
}

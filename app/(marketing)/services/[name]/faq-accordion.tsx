"use client";

import { useState } from "react";
import { Wrapper } from "@/components/ui/primitives";
import { BackToHomeClick } from "@/components/ui/buttons";

type KV = { key: string; value: string };

const QUESTION_CLASS =
  "text-[20px] font-semibold leading-[26.44px] tracking-[-0.01em] cursor-pointer inline-block";

/** FAQ list where clicking a question toggles its answer open/closed. */
export function FaqAccordion({ items }: { items?: KV[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (!items?.length) return null;

  return (
    <Wrapper>
      {items.map((d) => {
        const isOpen = openKey === d.key;
        return (
          <Wrapper key={d.key} className="gap-2 my-3">
            <BackToHomeClick
              heading={d.key}
              icon={isOpen ? "−" : "+"}
              className={QUESTION_CLASS}
              onclick={() => setOpenKey(isOpen ? null : d.key)}
            />
            {isOpen && (
              <ul className="list-disc">
                <li className="text-lg ml-8">{d.value}</li>
              </ul>
            )}
          </Wrapper>
        );
      })}
    </Wrapper>
  );
}

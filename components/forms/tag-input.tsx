"use client";

import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Comma/Enter-to-add chip input, shared by the keyword planner and the
 * content writer's SEO-keywords field.
 */
export function TagInput({
  id,
  tags,
  onChange,
  placeholder,
  maxTotalLength = 80,
}: {
  id?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTotalLength?: number;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  /** Adds one or more values as tags, skipping duplicates and stopping once
   * maxTotalLength would be exceeded (reports whichever reason applies). */
  function addTags(values: string[]) {
    const next = [...tags];
    let hadDuplicate = false;
    let hitLimit = false;

    for (const raw of values) {
      const value = raw.trim();
      if (!value) continue;
      if (next.includes(value)) {
        hadDuplicate = true;
        continue;
      }
      if (next.join(",").length + value.length > maxTotalLength) {
        hitLimit = true;
        break;
      }
      next.push(value);
    }

    if (next.length !== tags.length) onChange(next);
    setError(
      hitLimit
        ? `Keep the total under ${maxTotalLength} characters.`
        : hadDuplicate
          ? "That's already in the list."
          : null
    );
  }

  function commit(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "," && e.key !== "Enter") return;
    e.preventDefault();
    if (!draft.trim()) return;
    addTags([draft]);
    setDraft("");
  }

  /** A paste containing commas is a bulk keyword list — split it into
   * individual tags instead of dropping the whole string into the input. */
  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    if (!text.includes(",")) return;
    e.preventDefault();
    addTags(text.split(","));
    setDraft("");
  }

  function remove(value: string) {
    onChange(tags.filter((t) => t !== value));
  }

  return (
    <div>
      <div
        className={`${error ? "border-red-500!" : ""} flex items-end gap-1.5 flex-wrap max-md-mobile:p-6 p-4 focus-within:border-dark-100 focus-within:ring-4 focus-within:ring-dark-100/10 border-2 border-black/15 w-full bg-white transition-colors duration-200 rounded-[10px] text-base font-normal text-[#171717] leading-[15.96px] tracking-[0.02em]`}
      >
        <Input
          id={id}
          wrapperClassName="!w-auto flex-1"
          onKeyDown={commit}
          onPaste={handlePaste}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-h-7 border-0 focus:ring-0"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
          {tags.map((item) => (
            <span
              key={item}
              className="text-white text-sm flex items-center gap-1 py-1 px-2 rounded-full bg-dark-100/70"
            >
              {item}
              <button onClick={() => remove(item)} type="button" aria-label={`Remove ${item}`}>
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { StatusDot } from "./score-gauge";
import {
  UrlTable,
  ImageCardTable,
  DomSizeTable,
  AccessibilityTable,
  BestPracticesTable,
} from "./detail-tables";
import type { LighthouseAudit } from "./types";

const URL_TABLE_IDS = new Set([
  "render-blocking-resources", "unused-css-rules", "unused-javascript", "legacy-javascript",
  "total-byte-weight", "uses-long-cache-ttl", "mainthread-work-breakdown", "font-display",
  "uses-passive-event-listeners",
]);
const IMAGE_TABLE_IDS = new Set([
  "uses-responsive-images", "offscreen-images", "uses-optimized-images", "modern-image-formats",
  "unsized-images",
]);

function renderDetails(item: LighthouseAudit, category: "performance" | "accessibility" | "bestPractices" | "seo") {
  const items = item.details?.items;
  if (!items?.length) return null;

  if (category === "performance") {
    if (URL_TABLE_IDS.has(item.id)) return <UrlTable items={items} />;
    if (IMAGE_TABLE_IDS.has(item.id)) return <ImageCardTable items={items} />;
    if (item.id === "dom-size") return <DomSizeTable items={items} />;
    return null;
  }
  if (category === "bestPractices") return <BestPracticesTable items={items} />;
  return <AccessibilityTable items={items} />;
}

const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
};

export function AuditSection({
  title,
  audits,
  category,
  active,
}: {
  title: string;
  audits: LighthouseAudit[];
  category: "performance" | "accessibility" | "bestPractices" | "seo";
  active: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!active || !audits?.length) return null;

  return (
    <div className="my-5 space-y-2">
      <h2 className="mb-4 text-2xl font-normal leading-[29.08px] tracking-[-0.01em] text-dark-100">
        {title} ({audits.length})
      </h2>
      <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-2">
        {audits.map((item, i) => {
          const open = openIndex === i;
          return (
            <motion.div
              variants={rowItem}
              key={i}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpenIndex(open ? null : i)}
                onKeyDown={(e) => e.key === "Enter" && setOpenIndex(open ? null : i)}
                className={`${open ? "border-b border-gray-100 pb-3" : ""} gap-2 cursor-pointer flex justify-between items-center text-dark-100 text-base font-semibold`}
              >
                <span className="gap-2 flex items-center">
                  <StatusDot score={item.score * 100} />
                  {item.title}
                </span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={20} className="text-gray-400" />
                </motion.span>
              </div>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    {item.description && <p className="py-4 text-sm text-gray-500">{item.description}</p>}
                    {renderDetails(item, category)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Zap, Layers, Timer, Move } from "lucide-react";
import { ScoreGauge } from "./score-gauge";
import { AuditSection } from "./audit-section";
import type { PageInsights } from "./types";

const CATEGORY_TABS = ["performance", "accessibility", "bestPractices", "seo"] as const;
const METRIC_KEYS = [
  { key: "firstContentfulPaint", icon: Zap },
  { key: "largestContentfulPaint", icon: Layers },
  { key: "totalBlockingTime", icon: Timer },
  { key: "cumulativeLayoutShift", icon: Move },
] as const;

const metricLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const cardStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

/** Lighthouse score cards + tabbed pass/reject/N-A audit accordions. */
export function PageSpeedReport({ data }: { data: PageInsights }) {
  const [tab, setTab] = useState<(typeof CATEGORY_TABS)[number]>("performance");
  const active = data[tab];

  return (
    <div>
      <div className="flex justify-between gap-4 max-2xl:flex-col">
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="show"
          className="flex gap-4 bg-white py-4 px-8 rounded-2xl border border-gray-100 shadow-sm max-lg-tab:flex-wrap justify-between max-w-[40%] max-2xl:max-w-full w-full"
        >
          {CATEGORY_TABS.map(
            (key, i) =>
              data[key]?.score != null && (
                <motion.div variants={cardItem} key={key} className="flex items-center gap-4">
                  {i !== 0 && <div className="w-px bg-gray-200 max-lg-tab:hidden" />}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTab(key)}
                    className={`p-4 rounded-xl cursor-pointer transition-colors ${tab === key ? "bg-lightblue-100" : "hover:bg-gray-50"}`}
                  >
                    <ScoreGauge score={Math.round(data[key]!.score * 100)} label={data[key]!.title} suffix="%" />
                  </motion.button>
                </motion.div>
              )
          )}
        </motion.div>
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-[60%] max-2xl:max-w-full w-full"
        >
          {METRIC_KEYS.map(
            ({ key, icon: Icon }) =>
              data[key] && (
                <motion.div
                  variants={cardItem}
                  key={key}
                  className="flex items-center gap-3 bg-lightblue-100/60 rounded-xl px-4 py-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="w-4 h-4 text-dark-100" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-lg max-md-mobile:text-base block leading-tight font-semibold text-dark-100 truncate">
                      {data[key]}
                    </span>
                    <p className="text-xs font-medium leading-tight text-gray-500 truncate">{metricLabel(key)}</p>
                  </div>
                </motion.div>
              )
          )}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <AuditSection title="Passed Audits" audits={active?.passedAudits ?? []} category={tab} active />
          <AuditSection title="Rejected Audits" audits={active?.rejectedAudits ?? []} category={tab} active />
          <AuditSection title="Not Applicable Audits" audits={active?.notApplicableAudits ?? []} category={tab} active />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

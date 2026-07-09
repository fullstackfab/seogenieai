"use client";

import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";

/** good / needs-improvement / poor — matches Lighthouse's own thresholds. */
function statusColor(score: number) {
  return score >= 90 ? "#0c6" : score >= 50 ? "#fa3" : "#f33";
}

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DURATION = 1;

/** Tweens 0 → target with framer-motion's imperative `animate`, re-rendering each frame. */
function useCountUp(target: number, duration = DURATION) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, target, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: setValue });
    return () => controls.stop();
  }, [target, duration]);
  return value;
}

/** Circular progress ring for a 0-100 score — the number stays in text ink so color never carries meaning alone. */
export function ScoreGauge({ score, label, suffix }: { score: number; label: string; suffix?: string }) {
  const color = statusColor(score);
  const animatedScore = useCountUp(score);
  const offset = CIRCUMFERENCE - (Math.min(Math.max(animatedScore, 0), 100) / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={84} height={84} viewBox="0 0 84 84" className="-rotate-90">
        <circle cx={42} cy={42} r={RADIUS} fill="none" stroke="#eef1f5" strokeWidth={8} />
        <motion.circle
          cx={42}
          cy={42}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
        <text
          x={42}
          y={42}
          textAnchor="middle"
          dominantBaseline="central"
          transform="rotate(90 42 42)"
          className="fill-dark-100 font-semibold"
          style={{ fontSize: 20 }}
        >
          {Math.round(animatedScore)}
          {suffix ?? ""}
        </text>
      </svg>
      <p className="text-base text-dark-100 tracking-normal font-semibold text-center leading-5 text-[12px]">
        {label}
      </p>
    </div>
  );
}

/** Small pass/warn/fail dot used inside each audit accordion row. */
export function StatusDot({ score }: { score: number }) {
  return <span className="w-2 h-2 rounded-full inline-block" style={{ background: statusColor(score) }} />;
}

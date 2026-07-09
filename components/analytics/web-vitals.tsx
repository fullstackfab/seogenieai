"use client";

import { useReportWebVitals } from "next/web-vitals";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Reports Core Web Vitals (LCP, CLS, INP, FCP, TTFB) to GA4 as events.
 * The legacy app had no web-vitals reporting at all — this re-enables it.
 * Values follow GA4's convention: CLS scaled x1000, all rounded to ints.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    window.gtag?.("event", metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      non_interaction: true,
    });
  });
  return null;
}

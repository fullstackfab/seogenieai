/* eslint-disable @typescript-eslint/no-explicit-any */
// Google PageSpeed Insights / Lighthouse shapes are deeply nested and vary per
// audit id; typing them loosely here matches how the legacy renderer treated them.
export type LighthouseAudit = {
  id: string;
  title: string;
  description?: string;
  score: number;
  displayValue?: string;
  details?: any;
};

export type CategoryReport = {
  title: string;
  score: number;
  passedAudits: LighthouseAudit[];
  rejectedAudits: LighthouseAudit[];
  notApplicableAudits: LighthouseAudit[];
};

export type PageInsights = {
  firstContentfulPaint?: string;
  speedIndex?: string;
  largestContentfulPaint?: string;
  timeToInteractive?: string;
  totalBlockingTime?: string;
  cumulativeLayoutShift?: string;
  seo?: CategoryReport;
  accessibility?: CategoryReport;
  bestPractices?: CategoryReport;
  performance?: CategoryReport;
};

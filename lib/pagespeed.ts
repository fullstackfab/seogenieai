import "server-only";
import { env } from "@/lib/env";

type LighthouseAudit = {
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue?: string;
  details?: { items?: unknown[] };
};

type Category = { title: string; score: number; auditRefs: { id: string }[] };

type AuditSummary = {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
  details?: unknown[];
};

function extractAudits(
  auditKeys: string[],
  audits: Record<string, LighthouseAudit>,
  condition: "passed" | "notApplicable" | "rejected"
): AuditSummary[] {
  return auditKeys
    .filter((key) => {
      const audit = audits[key];
      if (!audit) return false;
      const scored = audit.scoreDisplayMode === "binary" || audit.scoreDisplayMode === "metricSavings";
      if (condition === "passed") return audit.score === 1 && scored;
      if (condition === "rejected") return (audit.score ?? 1) <= 0.5 && scored;
      return audit.scoreDisplayMode === "notApplicable";
    })
    .map((key) => ({
      id: key,
      title: audits[key].title,
      description: audits[key].description,
      score: audits[key].score,
      displayValue: audits[key].displayValue,
      details: audits[key].details?.items,
    }));
}

function getCategoryData(
  categoryKey: string,
  audits: Record<string, LighthouseAudit>,
  categories: Record<string, Category>
) {
  const category = categories[categoryKey];
  if (!category) return null;
  const refs = category.auditRefs.map((r) => r.id);
  return {
    title: category.title,
    score: category.score,
    passedAudits: extractAudits(refs, audits, "passed"),
    notApplicableAudits: extractAudits(refs, audits, "notApplicable"),
    rejectedAudits: extractAudits(refs, audits, "rejected"),
  };
}

const titleAndScore = (list: AuditSummary[]) => list.map((a) => ({ title: a.title, score: a.score }));

/**
 * Runs Google PageSpeed Insights v5 and shapes the result exactly like the
 * legacy Express service ({ pageInsights, report }). The legacy service
 * appended a stray "/" to every URL — dropped here.
 */
export async function runPageSpeedInsights(url: string, strategy: "mobile" | "desktop") {
  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", url);
  for (const cat of ["performance", "accessibility", "best-practices", "seo"]) {
    api.searchParams.append("category", cat);
  }
  api.searchParams.set("strategy", strategy);
  api.searchParams.set("key", env.PAGE_SPEED_INSIGHTS_KEY);

  const response = await fetch(api, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`PageSpeed API error: ${response.status}`);
  const { lighthouseResult } = await response.json();
  const { audits, categories } = lighthouseResult;

  const metrics = {
    firstContentfulPaint: audits["first-contentful-paint"]?.displayValue,
    speedIndex: audits["speed-index"]?.displayValue,
    largestContentfulPaint: audits["largest-contentful-paint"]?.displayValue,
    timeToInteractive: audits["interactive"]?.displayValue,
    totalBlockingTime: audits["total-blocking-time"]?.displayValue,
    cumulativeLayoutShift: audits["cumulative-layout-shift"]?.displayValue,
  };

  const seo = getCategoryData("seo", audits, categories);
  const accessibility = getCategoryData("accessibility", audits, categories);
  const bestPractices = getCategoryData("best-practices", audits, categories);
  const performance = getCategoryData("performance", audits, categories);

  const summarize = (c: NonNullable<ReturnType<typeof getCategoryData>>) => ({
    title: c.title,
    score: c.score,
    passedAudits: titleAndScore(c.passedAudits),
    rejectedAudits: titleAndScore(c.rejectedAudits),
  });

  return {
    pageInsights: { ...metrics, seo, accessibility, bestPractices, performance },
    report: {
      ...metrics,
      seo: seo && summarize(seo),
      accessibility: accessibility && summarize(accessibility),
      bestPractices: bestPractices && summarize(bestPractices),
      performance: performance && summarize(performance),
    },
  };
}

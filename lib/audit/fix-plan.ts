import "server-only";
import { getAnthropic, CLAUDE_MODEL } from "@/lib/anthropic/client";
import { logger } from "@/lib/logger";
import type { AuditCheck, FixPlanItem } from "@/lib/audit/types";

type Issue = { check: string; status: string; recommendation: string };

const NO_ISSUES_PLAN: FixPlanItem[] = [
  {
    priority: 1,
    effort: "Easy",
    impact: "High",
    title: "Maintain your excellent AI readiness",
    description:
      "Your site passes all major checks. Focus on publishing fresh, authoritative content and growing your backlink profile.",
    fix: "Monitor monthly and update your sitemap and structured data as content grows.",
  },
];

function collectIssues(
  audit: Record<string, AuditCheck> | null | undefined,
  domainAuthority: unknown
): Issue[] {
  const issues: Issue[] = [];
  if (audit) {
    for (const [key, item] of Object.entries(audit)) {
      if (item && typeof item === "object" && (item.status === "fail" || item.status === "warn")) {
        issues.push({ check: key, status: item.status, recommendation: item.recommendation });
      }
    }
  }
  const da = Number(domainAuthority);
  if (!isNaN(da) && da < 30) {
    issues.push({
      check: "domainAuthority",
      status: "warn",
      recommendation: `Low Domain Authority (${da}). Build quality backlinks to improve.`,
    });
  }
  return issues;
}

/** Extract a fix array from whatever JSON shape the model returned. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function coerceFixes(parsed: any): FixPlanItem[] {
  if (Array.isArray(parsed)) return parsed;
  const wrapped = parsed.fixes ?? parsed.plan ?? parsed.actions;
  if (wrapped) return wrapped;
  if (parsed.priority !== undefined && parsed.title !== undefined) return [parsed];
  const firstArray = Object.values(parsed).find((v) => Array.isArray(v));
  if (firstArray) return firstArray as FixPlanItem[];
  return Object.values(parsed).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (v): v is FixPlanItem => !!v && typeof v === "object" && (v as any).priority !== undefined
  );
}

/** Claude Haiku 4.5 prioritised fix plan for failing/warning checks (ported prompt). */
export async function generateFixPlan(
  audit: Record<string, AuditCheck> | null | undefined,
  domainAuthority: unknown
): Promise<FixPlanItem[]> {
  const issues = collectIssues(audit, domainAuthority);
  if (issues.length === 0) return NO_ISSUES_PLAN;

  const prompt = `You are a senior SEO and AI readiness consultant writing a paid audit report. Based on the failing/warning checks below, create a detailed, expert-level action plan that justifies the client's investment.

Issues found:
${JSON.stringify(issues, null, 2)}

Return ONLY valid JSON — a root-level array of exactly 5-7 fix items. No markdown, no explanation, no wrapper key.
Each item MUST have ALL of these fields:
- priority: number (1 = most critical)
- effort: "Easy" | "Medium" | "Hard"
- impact: "High" | "Medium" | "Low"
- title: clear action title, max 10 words
- description: 3-4 sentences — explain WHY this check matters specifically for AI crawler indexing and citation, what the business risk is of leaving it unfixed, and what improvement to expect
- fix: detailed step-by-step implementation guide (4-6 sentences). Be specific: include exact tag names, record types, tool names, file paths. A developer should be able to implement this without googling.
- resources: optional string — 1-2 specific tool names or documentation URLs that help implement this fix (e.g. "Google Search Console, schema.org/Organization")

Rules:
- Sort by highest impact first, then easiest effort
- Focus on AI crawler readiness, LLM citation signals, and structured data
- Be specific and technical — generic advice is not acceptable
- Assume the client is a business owner who will hand this to a developer`;

  try {
    const completion = await getAnthropic().messages.create({
      model: CLAUDE_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
      temperature: 0.3,
    });
    const firstBlock = completion.content[0];
    const raw = firstBlock?.type === "text" ? firstBlock.text : "[]";
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const fixes = coerceFixes(JSON.parse(cleaned));
    return Array.isArray(fixes) ? fixes.slice(0, 7) : [];
  } catch (err) {
    logger.error("Fix plan generation failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return [];
  }
}

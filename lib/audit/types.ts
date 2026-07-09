export type CheckStatus = "pass" | "warn" | "fail" | "info";

export type AuditCheck = {
  status: CheckStatus;
  value: string | null;
  recommendation: string;
  locked?: boolean;
  length?: number;
  tags?: Record<string, string>;
  details?: Record<string, boolean>;
  type?: string | null;
  links?: string[];
};

export type AuditResult = {
  url: string;
  generatedAt: string;
  isPaid: boolean;
} & Record<string, AuditCheck | string | boolean>;

export type HtmlSignals = {
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  langAttr: string | null;
  canonical: string | null;
  hreflang: boolean;
  metaRobots: string | null;
  ogTags: Record<string, string>;
  twitterCard: string | null;
  viewport: boolean;
  jsonLd: Record<string, unknown> | null;
  sameAsLinks: string[];
  noSnippet: boolean;
  hasPaywall: boolean;
};

export type RobotsResult = {
  present: boolean;
  hasAiDirectives: boolean;
  aiBlocked: boolean;
  raw?: string;
};

export type SitemapResult = { present: boolean; url: string | null };

export type DnsResult = { dnssec: boolean; caa: boolean; dmarc: boolean; spf: boolean };

export type FixPlanItem = {
  priority: number;
  effort: "Easy" | "Medium" | "Hard";
  impact: "High" | "Medium" | "Low";
  title: string;
  description: string;
  fix: string;
  resources?: string;
};

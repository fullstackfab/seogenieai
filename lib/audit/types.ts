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
  h1Count: number;
  headingLevelsSkipped: boolean;
  langAttr: string | null;
  canonical: string | null;
  hreflang: boolean;
  metaRobots: string | null;
  ogTags: Record<string, string>;
  twitterCard: string | null;
  viewport: boolean;
  jsonLd: Record<string, unknown> | null;
  jsonLdTypes: string[];
  sameAsLinks: string[];
  noSnippet: boolean;
  hasPaywall: boolean;
  favicon: boolean;
  appleTouchIcon: boolean;
  rssFeed: boolean;
  imgTotal: number;
  imgMissingAlt: number;
  mixedContentCount: number;
  internalLinks: number;
  externalLinks: number;
  unsafeBlankLinks: number;
};

export type RobotsResult = {
  present: boolean;
  hasAiDirectives: boolean;
  aiBlocked: boolean;
  raw?: string;
};

export type SitemapResult = {
  present: boolean;
  url: string | null;
  urlCount?: number;
  sampledOk?: boolean;
};

export type DnsResult = {
  dnssec: boolean;
  caa: boolean;
  dmarc: boolean;
  spf: boolean;
  mx: boolean;
};

export type PageFetchResult = { html: string | null; headers: Record<string, string> };

export type Soft404Result = { checked: boolean; soft404: boolean; status: number | null };

export type RedirectsResult = {
  checked: boolean;
  consistent: boolean;
  canonicalHost: string | null;
  variants: Record<string, string>;
};

export type SslResult = {
  checked: boolean;
  validTo: string | null;
  daysRemaining: number | null;
  issuer: string | null;
};

export type WellKnownResult = { llmsTxt: boolean; securityTxt: boolean };

export type FixPlanItem = {
  priority: number;
  effort: "Easy" | "Medium" | "Hard";
  impact: "High" | "Medium" | "Low";
  title: string;
  description: string;
  fix: string;
  resources?: string;
};

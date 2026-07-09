import type { NextConfig } from "next";

// Every route that renders a PDF (directly or via lib/pdf/generate-report.ts)
// needs @sparticuz/chromium's binary assets included in its deployed function —
// Vercel's file tracer doesn't pick them up on its own since they're read via
// chromium.executablePath()'s own fs logic, not a static require()/import.
const CHROMIUM_BIN = ["./node_modules/@sparticuz/chromium/bin/**"];
const PDF_ROUTES = [
  "/api/ai-audit/pdf",
  "/api/ai-audit/resend",
  "/api/domain-analysis/pdf",
  "/api/domain-analysis/report",
  "/api/insight/email",
  "/api/insight/pdf",
  "/api/stripe/webhook",
];

// Security headers live in proxy.ts (single source of truth, fabcode-security Rule 5).
const nextConfig: NextConfig = {
  allowedDevOrigins: ["7574-223-178-213-80.ngrok-free.app"],
  serverExternalPackages: ["mongoose", "puppeteer-core", "@sparticuz/chromium"],
  outputFileTracingIncludes: Object.fromEntries(PDF_ROUTES.map((route) => [route, CHROMIUM_BIN])),
};

export default nextConfig;

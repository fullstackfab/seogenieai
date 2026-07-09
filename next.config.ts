import type { NextConfig } from "next";

// Security headers live in proxy.ts (single source of truth, fabcode-security Rule 5).
const nextConfig: NextConfig = {
  allowedDevOrigins: ["a6eb-223-178-213-80.ngrok-free.app"],
  serverExternalPackages: ["mongoose", "puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;

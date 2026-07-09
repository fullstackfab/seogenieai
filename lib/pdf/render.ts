import "server-only";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { logger } from "@/lib/logger";

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--font-render-hinting=none",
];

/**
 * Chromium resolution: on Vercel we use @sparticuz/chromium's bundled binary;
 * locally set PUPPETEER_EXECUTABLE_PATH (e.g. your installed Chrome) since the
 * sparticuz binary only ships for linux-x64.
 */
async function resolveExecutablePath(): Promise<string> {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  if (process.platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }
  return chromium.executablePath();
}

export async function renderPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: await resolveExecutablePath(),
    args: process.platform === "linux" ? [...chromium.args, ...LAUNCH_ARGS] : LAUNCH_ARGS,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 300));
    const raw = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
  } finally {
    await browser.close().catch((err) => {
      logger.warn("Failed to close Chromium", {
        message: err instanceof Error ? err.message : "unknown",
      });
    });
  }
}

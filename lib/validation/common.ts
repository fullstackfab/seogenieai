import { z } from "zod";

const PRIVATE_HOST_PATTERN =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[?::1\]?$|172\.(1[6-9]|2\d|3[01])\.)/i;

/** Rejects private/loopback hosts to blunt SSRF on url-scanning endpoints. */
export function isPublicHttpUrl(raw: string): boolean {
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return !PRIVATE_HOST_PATTERN.test(url.hostname);
  } catch {
    return false;
  }
}

export const domainSchema = z
  .string()
  .trim()
  .min(3)
  .max(253)
  .refine(isPublicHttpUrl, "Must be a valid public domain");

export const urlSchema = z
  .string()
  .trim()
  .min(3)
  .max(2048)
  .refine(isPublicHttpUrl, "Must be a valid public http(s) URL");

/** Normalizes "example.com", "https://www.example.com/x" → "example.com". */
export function extractDomain(input: string): string {
  try {
    return new URL(input.startsWith("http") ? input : `https://${input}`).hostname.replace(
      /^www\./,
      ""
    );
  } catch {
    return input;
  }
}

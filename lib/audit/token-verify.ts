import "server-only";
import type { HydratedDocument } from "mongoose";
import { dbConnect } from "@/lib/db";
import { PaidAudit, type PaidAuditDoc } from "@/models/PaidAudit";
import { isTokenWellFormed } from "@/lib/audit-token";

function normalizeAuditUrl(u: string): string {
  try {
    return new URL(u.startsWith("http") ? u : `https://${u}`).href
      .replace(/\/$/, "")
      .toLowerCase();
  } catch {
    return u.toLowerCase().replace(/\/$/, "");
  }
}

/**
 * Validates a paid-report access token against the PaidAudit record and the
 * audited URL. Shared by paid-data and verify-access.
 */
export async function verifyPaidToken(
  token: unknown,
  url: string
): Promise<{ valid: boolean; expiresAt?: Date | null }> {
  if (!isTokenWellFormed(token)) return { valid: false };
  await dbConnect();
  const record = await PaidAudit.findOne({
    accessToken: token,
    expiresAt: { $gt: new Date() },
  }).lean();
  if (!record) return { valid: false };
  if (normalizeAuditUrl(record.auditUrl) !== normalizeAuditUrl(url)) return { valid: false };
  return { valid: true, expiresAt: record.expiresAt };
}

/** Same validation as verifyPaidToken, but returns the hydrated document (not .lean()) so callers can update it — used by the paid-data route to read/write the cached reportData. */
export async function getValidPaidAudit(
  token: unknown,
  url: string
): Promise<HydratedDocument<PaidAuditDoc> | null> {
  if (!isTokenWellFormed(token)) return null;
  await dbConnect();
  const record = await PaidAudit.findOne({ accessToken: token, expiresAt: { $gt: new Date() } });
  if (!record) return null;
  if (normalizeAuditUrl(record.auditUrl) !== normalizeAuditUrl(url)) return null;
  return record;
}

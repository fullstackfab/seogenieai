import "server-only";
import { google } from "googleapis";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { env } from "@/lib/env";

/** OAuth2 client type from googleapis' bundled auth library. */
export type GoogleAuthClient = InstanceType<typeof google.auth.OAuth2>;

/**
 * Builds a per-request OAuth2 client from the signed-in user's stored Google
 * tokens. Per-request instances fix the legacy Express bug where one shared
 * client leaked credentials across concurrent users. googleapis auto-refreshes
 * the access token from the refresh token; rotated tokens are persisted.
 */
export async function getGoogleClientForUser(email: string): Promise<GoogleAuthClient | null> {
  await dbConnect();
  const user = await User.findOne({ email }).lean();
  if (!user?.googleTokens?.refresh_token) return null;

  const client = new google.auth.OAuth2({
    clientId: env.AUTH_GOOGLE_ID,
    clientSecret: env.AUTH_GOOGLE_SECRET,
  });
  client.setCredentials({
    access_token: user.googleTokens.access_token,
    refresh_token: user.googleTokens.refresh_token,
    expiry_date: user.googleTokens.expiry_date,
  });

  client.on("tokens", (tokens) => {
    const update: Record<string, unknown> = {};
    if (tokens.access_token) update["googleTokens.access_token"] = tokens.access_token;
    if (tokens.refresh_token) update["googleTokens.refresh_token"] = tokens.refresh_token;
    if (tokens.expiry_date) update["googleTokens.expiry_date"] = tokens.expiry_date;
    if (Object.keys(update).length > 0) {
      User.updateOne({ email }, { $set: update }).catch(() => {
        /* best-effort persistence; next sign-in re-syncs tokens */
      });
    }
  });

  return client;
}

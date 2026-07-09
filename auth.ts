import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { env } from "@/lib/env";

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
].join(" ");

/**
 * Persist Google tokens on our legacy "users" collection so server routes
 * (analytics-report) can build an OAuth client from a durable refresh token.
 * Google only returns refresh_token on first consent, so never overwrite a
 * stored one with undefined.
 */
async function persistGoogleTokens(
  email: string,
  tokens: {
    access_token?: string;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    expires_at?: number;
  }
) {
  await dbConnect();
  const update: Record<string, unknown> = {
    "googleTokens.access_token": tokens.access_token,
    "googleTokens.scope": tokens.scope,
    "googleTokens.token_type": tokens.token_type,
    "googleTokens.expiry_date": tokens.expires_at ? tokens.expires_at * 1000 : undefined,
  };
  if (tokens.refresh_token) update["googleTokens.refresh_token"] = tokens.refresh_token;
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);
  await User.updateOne({ email }, { $set: update, $setOnInsert: { email } }, { upsert: true });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope: GOOGLE_SCOPES,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        await persistGoogleTokens(profile.email, {
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          scope: account.scope,
          token_type: account.token_type,
          expires_at: account.expires_at,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) session.user.email = token.email;
      return session;
    },
  },
});

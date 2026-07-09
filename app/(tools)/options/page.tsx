// Rendering: SSR — session-gated (redirects to Google sign-in if not authenticated);
// the option picker + date-range compare UI is a client leaf.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OptionsView } from "@/sections/options/options-view";

export const metadata: Metadata = {
  title: "Choose Analysis Range",
  robots: { index: false, follow: false },
};

export default async function OptionsPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin/google?callbackUrl=/options");

  return <OptionsView />;
}

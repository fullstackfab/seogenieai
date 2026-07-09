// Rendering: SSR — session-gated; lists this user's paid AI Growth Reports.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { PaidAnalyticsReport } from "@/models/PaidAnalyticsReport";
import { ReportsList } from "@/sections/domain-analysis/reports-list";

export const metadata: Metadata = {
  title: "My Reports",
  robots: { index: false, follow: false },
};

export default async function DomainAnalysisReportsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/domain-analysis");

  await dbConnect();
  const docs = await PaidAnalyticsReport.find({ userEmail: session.user.email, reportHtml: { $ne: null } })
    .sort({ createdAt: -1 })
    .lean();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    domain: doc.domain,
    createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  return <ReportsList items={items} />;
}

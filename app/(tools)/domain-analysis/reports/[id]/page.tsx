// Rendering: SSR — session-gated; loads one paid AI Growth Report directly
// from the database so it has a permanent, shareable-with-yourself URL.
import type { Metadata } from "next";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { PaidAnalyticsReport } from "@/models/PaidAnalyticsReport";
import { ReportDetailView } from "@/sections/domain-analysis/report-detail-view";

export const metadata: Metadata = {
  title: "AI Growth Report",
  robots: { index: false, follow: false },
};

export default async function DomainAnalysisReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/domain-analysis");

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await dbConnect();
  const doc = await PaidAnalyticsReport.findOne({ _id: id, userEmail: session.user.email }).lean();
  if (!doc?.reportHtml) notFound();

  return (
    <ReportDetailView
      id={id}
      domain={doc.domain}
      html={doc.reportHtml}
      createdAt={doc.createdAt?.toISOString() ?? new Date().toISOString()}
    />
  );
}

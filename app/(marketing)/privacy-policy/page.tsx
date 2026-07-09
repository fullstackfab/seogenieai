// Rendering: SSG — static legal content.
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy - SeoGenieAI",
  description: "How SeoGenieAI collects, uses, and safeguards your Google user data.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <h2 className="text-2xl font-bold mb-4">Introduction</h2>
      <p className="mb-4">
        Welcome to <span className="text-dark-100 font-bold">SeoGenieAI</span>. We are committed to
        protecting your privacy and ensuring the security of your personal information. This
        Privacy Policy outlines how our app collects, uses, and safeguards Google user data,
        specifically Google Analytics data, to provide you with analytics reports and graphical
        representations.
      </p>

      <h2 className="text-2xl font-bold mb-4">Data Collection</h2>
      <p className="mb-4">Our app accesses and collects the following Google user data:</p>
      <p className="mb-4">
        <span className="text-dark-100 text-xl font-bold"> Google Analytics Data:</span> This
        includes data related to website traffic, user behavior, and other metrics provided by
        Google Analytics.
      </p>

      <h2 className="text-2xl font-bold mb-4">Data Usage</h2>
      <p className="mb-4">
        The Google Analytics data accessed by our app is used solely for the purpose of generating
        detailed analytics reports and graphical representations. This helps you understand user
        behavior, track performance metrics, and make informed decisions to optimize your website
        or application.
      </p>

      <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
      <p className="mb-4">
        <span className="text-dark-100 text-xl font-bold"> Retention Period:</span> The Google
        Analytics data accessed and processed by our app is retained only as long as necessary to
        provide you with the requested analytics reports and services. Once the data has been
        processed and the reports generated, it is deleted from our systems — we&apos;re not saving
        it in any kind of database.
      </p>
      <p className="mb-4">
        <span className="text-dark-100 text-xl font-bold"> Deletion Requests:</span> After the data
        is accessed and processed all data is deleted automatically. You may request the deletion of
        your Google Analytics data at any time. Upon receiving such a request, we will promptly
        delete the data from our systems, ensuring that it is no longer accessible or used by our
        app.
      </p>

      <h2 className="text-2xl font-bold mb-4">Data Security</h2>
      <p className="mb-4">
        We take data security very seriously. All Google user data accessed by our app is stored
        securely and is protected against unauthorized access, alteration, or disclosure. We
        implement industry-standard security measures to ensure the confidentiality and integrity of
        your data.
      </p>

      <h2 className="text-2xl font-bold mb-4">Sharing of Data</h2>
      <h2 className="text-2xl font-bold mb-4">Sale of Google User Data</h2>
      <p className="mb-4">
        We do not sell Google user data to third parties. Any data collected is used solely for the
        purpose of providing and enhancing the services of{" "}
        <span className="text-dark-100 font-bold"> SeoGenieAI</span>. We&apos;re not storing any
        data to <span className="text-dark-100 font-bold"> SeoGenieAI</span> database.
      </p>

      <h2 className="text-2xl font-bold mb-4">Use of Google User Data for Other Purposes</h2>
      <p className="mb-4">
        Google user data collected by <span className="text-dark-100 font-bold"> SeoGenieAI</span>{" "}
        is used exclusively for providing or improving the application&apos;s functionality. We do
        not use this data for any other purpose without your explicit consent.
      </p>

      <h2 className="text-2xl font-bold mb-4">Transfer of Google User Data to Third Parties</h2>
      <p className="mb-4">We do not transfer the data to any third parties.</p>

      <h2 className="text-2xl font-bold mb-4">Scopes Discrepancy</h2>
      <p className="mb-4">
        We ensure that the scopes requested in our Cloud Console match the API calls made by the
        application.
      </p>

      <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
      <p className="mb-4">
        We may update our privacy policy from time to time. Any changes will be communicated to you,
        and your continued use of <span className="text-dark-100 font-bold"> SeoGenieAI</span> will
        be subject to the updated policy.
      </p>

      <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy, please contact us at{" "}
        <span className="font-bold underline">
          <a href="mailto:contact@seogenieai.com">contact@seogenieai.com</a>.
        </span>
      </p>
    </LegalPage>
  );
}

// Rendering: SSG — static legal content.
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service - SeoGenieAI",
  description: "Terms of Service governing use of the SeoGenieAI SEO analysis application.",
  alternates: { canonical: "/terms-of-services" },
};

export default function TermsOfServicesPage() {
  return (
    <LegalPage title="Terms of Service">
      <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
      <p className="mb-4">
        By accessing or using SeoGenieAI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you
        agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with
        these Terms, please do not use our app.
      </p>

      <h2 className="text-2xl font-bold mb-4">Description of Service</h2>
      <p className="mb-4">
        <span className="text-dark-100 font-bold">SeoGenieAI</span> provides services regarding SEO
        analysis of websites. To use certain features of our app, you must log in using Google
        Login. By using Google Login, you agree to allow us to access your basic Google profile
        information.
      </p>

      <h2 className="text-2xl font-bold mb-4">User Responsibilities</h2>
      <h3 className="text-xl font-semibold mb-4">Account Security</h3>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your Google account credentials
        and for all activities that occur under your account. You agree to notify us immediately of
        any unauthorized use of your account or any other security breaches.
      </p>
      <h3 className="text-xl font-semibold mb-4">Accurate Information</h3>
      <p className="mb-4">
        You agree to provide accurate, current, and complete information when using our app, and to
        update your information as necessary to maintain its accuracy.
      </p>
      <h3 className="text-xl font-semibold mb-4">Prohibited Conduct</h3>
      <p className="mb-4">You agree not to:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Use our app for any illegal or unauthorized purpose.</li>
        <li>Interfere with or disrupt the operation of our app.</li>
        <li>Attempt to gain unauthorized access to our app or any related systems or networks.</li>
      </ul>

      <h2 className="text-2xl font-bold mb-4">Privacy</h2>
      <p className="mb-4">
        Your privacy is important to us. Please refer to our Privacy Policy for information on how
        we collect, use, and disclose your personal information when you use our app.
      </p>

      <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
      <p className="mb-4">
        All content and materials available on our app, including but not limited to text, graphics,
        logos, and software, are the property of SeoGenieAI or its licensors and are protected by
        intellectual property laws. You may not use, reproduce, or distribute any content from our
        app without our express permission.
      </p>

      <h2 className="text-2xl font-bold mb-4">Termination</h2>
      <p className="mb-4">
        We reserve the right to terminate or suspend your access to our app at any time, with or
        without notice, for any reason, including if we believe you have violated these Terms.
      </p>

      <h2 className="text-2xl font-bold mb-4">Disclaimers and Limitation of Liability</h2>
      <h3 className="text-xl font-semibold mb-4">Disclaimers</h3>
      <p className="mb-4">
        Our app is provided &quot;as is&quot; and &quot;as available,&quot; without any warranties of
        any kind, either express or implied. We do not warrant that the app will be uninterrupted or
        error-free.
      </p>
      <h3 className="text-xl font-semibold mb-4">Limitation of Liability</h3>
      <p className="mb-4">
        To the fullest extent permitted by law,{" "}
        <span className="text-dark-100 font-bold">SeoGenieAI</span> shall not be liable for any
        indirect, incidental, special, consequential, or punitive damages arising out of or relating
        to your use of our app.
      </p>

      <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
      <p className="mb-4">
        These Terms shall be governed by and construed in accordance with the laws of [Your
        Jurisdiction], without regard to its conflict of law principles.
      </p>

      <h2 className="text-2xl font-bold mb-4">Changes to the Terms</h2>
      <p className="mb-4">
        We may modify these Terms from time to time. Any changes will be effective immediately upon
        posting the updated Terms on our app. It is your responsibility to review these Terms
        periodically to ensure you are aware of any changes.
      </p>

      <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
      <p className="mb-4">
        If you have any questions or concerns about these Terms, please contact us at{" "}
        <span className="font-bold underline">
          <a href="mailto:contact@seogenieai.com">contact@seogenieai.com</a>.
        </span>
      </p>
    </LegalPage>
  );
}

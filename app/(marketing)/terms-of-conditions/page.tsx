// Rendering: SSG — static legal content.
import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms and Conditions - SeoGenieAI",
  description: "Terms and conditions for using SeoGenieAI, including Google Login usage.",
  alternates: { canonical: "/terms-of-conditions" },
};

export default function TermsOfConditionsPage() {
  return (
    <LegalPage title="Terms and Conditions">
      <h2 className="text-2xl font-bold mb-4">Introduction</h2>
      <p className="mb-4">
        Welcome to <span className="text-dark-100 font-bold">SeoGenieAI</span>. By using our
        application, you agree to comply with and be bound by the following terms and conditions.
        Please read them carefully.
      </p>

      <h2 className="text-2xl font-bold mb-4">Use of Google Login</h2>
      <h3 className="text-xl font-semibold mb-4">Google Login Verification</h3>
      <p className="mb-4">
        Our application uses Google Login as a method of verifying your identity. By logging in with
        Google, you agree to allow us to access your basic Google profile information, including
        your name, email address, and profile picture. This information is used solely for the
        purpose of verifying your identity and enhancing your user experience.
      </p>
      <h3 className="text-xl font-semibold mb-4">Account Security</h3>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your Google account and any
        activities that occur under your account. We recommend that you log out of your Google
        account after each session, especially when using a shared or public device.
      </p>
      <h3 className="text-xl font-semibold mb-4">Data Collection and Use</h3>
      <p className="mb-4">
        By using Google Login, you consent to the collection, use, and storage of your Google
        profile information in accordance with our Privacy Policy. We do not share your personal
        information with third parties without your consent, except as required by law.
      </p>

      <h2 className="text-2xl font-bold mb-4">User Conduct</h2>
      <p className="mb-4">
        You agree to use our app in a lawful manner and refrain from any activities that may harm or
        interfere with the operation of the app or other users.
      </p>

      <h2 className="text-2xl font-bold mb-4">Termination</h2>
      <p className="mb-4">
        We reserve the right to terminate or suspend your access to our app if you violate these
        Terms and Conditions or engage in any unlawful activities.
      </p>

      <h2 className="text-2xl font-bold mb-4">Changes to the Terms and Conditions</h2>
      <p className="mb-4">
        We may update these Terms and Conditions from time to time. Any changes will be effective
        immediately upon posting on this page. It is your responsibility to review these Terms and
        Conditions periodically.
      </p>

      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
      <p className="mb-4">
        If you have any questions or concerns about these Terms and Conditions, please contact us at{" "}
        <span className="font-bold underline">
          <a href="mailto:contact@seogenieai.com">contact@seogenieai.com</a>.
        </span>
      </p>
    </LegalPage>
  );
}

// Rendering: SSG shell — the form itself is a client leaf posting to /api/contact.
import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact Us - SeoGenieAI",
  description:
    "Get in touch with the SeoGenieAI team — SEO experts, digital marketers and developers ready to help your business grow online.",
  alternates: { canonical: "/contact-us" },
  openGraph: {
    title: "Contact Us - SeoGenieAI",
    description:
      "Get in touch with the SeoGenieAI team — SEO experts, digital marketers and developers ready to help your business grow online.",
    url: "/contact-us",
    type: "website",
  },
};

export default function ContactUsPage() {
  return (
    <Container>
      <ContactForm />
    </Container>
  );
}

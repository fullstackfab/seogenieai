import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { H1, Text } from "@/components/ui/typography";
import { LinkButton } from "@/components/ui/buttons";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you are looking for could not be found. Return to SEOGenieAI to explore services, SEO tools, and support.",
};

export default function NotFound() {
  return (
    <Wrapper className="min-h-screen flex items-center justify-center py-16 px-4">
      <Container>
        <Wrapper className="flex justify-center">
          <Link href="/" className="mb-10 inline-block" aria-label="SEOGenieAI home">
            <Image src="/images/SEOGenie.png" alt="SEOGENIE" width={171} height={36} />
          </Link>
        </Wrapper>

        <Wrapper className="mx-auto max-w-[640px] bg-white rounded-2xl shadow-6xl px-8 py-12 text-center max-md-mobile:px-5 max-md-mobile:py-8">
          <Wrapper className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-lightblue-100">
            <Compass className="h-7 w-7 text-dark-100" aria-hidden="true" />
          </Wrapper>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-dark-100">
            Error 404
          </p>
          <H1 as="tag" className="mt-3 font-bold! text-[#171717]">
            We lost this page.
          </H1>
          <Text className="mt-4 mx-auto max-w-[480px] text-base! leading-relaxed! text-[#475569]">
            The page you’re looking for may have moved, been removed, or never existed. Let’s get
            you back to the tools and services that matter.
          </Text>

          <Wrapper className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <LinkButton to="/">Back to home</LinkButton>
            <LinkButton to="/contact-us" variant="outlined">
              Contact support
            </LinkButton>
          </Wrapper>

          <Wrapper className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-[#475569]">
            <Link href="/services" className="transition-colors hover:text-dark-100">
              Services
            </Link>
            <span className="text-black/20">•</span>
            <Link href="/about-us" className="transition-colors hover:text-dark-100">
              About us
            </Link>
            <span className="text-black/20">•</span>
            <Link href="/contact-us" className="transition-colors hover:text-dark-100">
              Contact
            </Link>
          </Wrapper>
        </Wrapper>
      </Container>
    </Wrapper>
  );
}

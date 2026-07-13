import Image from "next/image";
import Link from "next/link";
import { Container, Wrapper } from "@/components/ui/primitives";

const FOOTER_LINKS = [
  { label: "About us", href: "/about-us" },
  { label: "Contact us", href: "/contact-us" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-of-conditions" },
  { label: "Terms of Services", href: "/terms-of-services" },
];

export function Footer() {
  return (
    <footer className="py-6 max-md-tab:py-8 mt-auto">
      <Container>
        <Wrapper className="bg-white rounded-xl">
          <Wrapper className="p-4 flex flex-row flex-wrap items-center justify-center w-full text-center gap-y-6 gap-x-12 lg:justify-between">
            <Wrapper className="min-w-[171px] max-lg:flex-1 max-md-tab:flex max-md-tab:justify-center">
              <Link href="/">
                <Image src="/images/SEOGenie.png" alt="SEOGENIE" width={171} height={36} />
              </Link>
            </Wrapper>
            <ul className="flex flex-wrap items-center justify-center gap-y-2 gap-x-8">
              {FOOTER_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block text-[12px] md:text-base antialiased font-normal leading-relaxed transition-colors hover:text-blue-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Wrapper>
          <Wrapper className="flex p-2 items-center justify-center rounded-b-xl bg-dark-100">
            <span className="text-white text-center">
              Designed and Developed by{" "}
              <Link className="underline" href="https://thefabcode.com" target="_blank">
                The Fabcode IT Solutions LLP
              </Link>
            </span>
          </Wrapper>
        </Wrapper>
      </Container>
    </footer>
  );
}

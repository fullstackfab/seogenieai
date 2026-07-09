// Rendering: SSG — static service catalogue from lib/services-data.
import type { Metadata } from "next";
import { Container, Wrapper } from "@/components/ui/primitives";
import { servicesData } from "@/lib/services-data";
import { ServiceCard } from "./service-card";

export const metadata: Metadata = {
  title: "Services - SeoGenieAI | SEO, Content & Website Analysis",
  description:
    "Explore SeoGenieAI services: website traffic analysis, AI content writing, keyword research and website speed insights — everything you need for your digital journey.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services - SeoGenieAI | SEO, Content & Website Analysis",
    description:
      "Explore SeoGenieAI services: website traffic analysis, AI content writing, keyword research and website speed insights.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return (
    <Wrapper>
      <Wrapper className="mb-10 mt-16 max-sm-tab:mt-0">
        <Container className="items-center flex justify-center max-md-tab:flex-col-reverse">
          <Wrapper className="max-w-[55%] max-md-tab:max-w-full">
            <h1 className="text-[2.8rem] font-semibold leading-tight tracking-tight max-xl:text-4xl max-sm-tab:text-2xl">
              <span className="text-dark-100 font-bold">SeoGenieAI:</span> Your Partnering with you
              on your Digital Journey
            </h1>
            <p className="mt-5 text-lg">
              From inception, to execution, to sustainment... we can help. Are you just beginning
              your digital journey? Are you moving through a digital transition? Do you simply need
              an extra hand in sustaining what you&apos;ve already got? We&apos;ve got you.
            </p>
          </Wrapper>
        </Container>
      </Wrapper>
      <Wrapper className="mb-10 mt-16 max-sm-tab:mt-0">
        <Container className="items-center flex justify-center">
          <Wrapper>
            <h2 className="text-4xl leading-[29.08px] tracking-[-0.01em] font-semibold text-center my-8">
              What Services We Offer
            </h2>
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              {servicesData.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </Wrapper>
        </Container>
      </Wrapper>
    </Wrapper>
  );
}

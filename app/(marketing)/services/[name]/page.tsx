// Rendering: SSG via generateStaticParams — all service slugs prebuilt from lib/services-data.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Wrapper } from "@/components/ui/primitives";
import { HireExpert } from "@/components/hire-expert";
import { BackToHome } from "@/components/ui/buttons";
import { servicesData } from "@/lib/services-data";
import { ServiceSections, faqJsonLd } from "./service-sections";

type Props = { params: Promise<{ name: string }> };

export function generateStaticParams() {
  return servicesData.map((s) => ({ name: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const service = servicesData.find((s) => s.slug === name);
  if (!service) return { title: "Service not found" };
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: service.title,
      description: service.description,
      url: `/services/${service.slug}`,
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { name } = await params;
  const service = servicesData.find((s) => s.slug === name);
  if (!service) notFound();

  const jsonLd = faqJsonLd(service.data);

  return (
    <Wrapper>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Wrapper className="mb-10 mt-16 max-sm-tab:mt-0">
        <Container className="items-center justify-center">
          <div className="bg-white rounded-md flex justify-center">
            <div className="px-6 py-8 w-[70%] max-md-tab:w-full">
              <BackToHome heading="All services" link="/services" />
              <ServiceSections data={service.data} />
            </div>
          </div>
        </Container>
      </Wrapper>
      <HireExpert />
    </Wrapper>
  );
}

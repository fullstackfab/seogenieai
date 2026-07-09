// Rendering: SSG — static marketing content, no request-time data.
import type { Metadata } from "next";
import Image from "next/image";
import { Container, Wrapper } from "@/components/ui/primitives";
import { Text } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "About Us - SeoGenieAI | Best SEO Tools for Small Businesses",
  description:
    "Learn about SeoGenieAI, the best SEO content writing and keyword research tool for small businesses, designed to enhance your online presence and drive success.",
  keywords: [
    "SEO Content Writing Tools",
    "Best SEO Tools for Small Businesses",
    "Best SEO Keyword Research Tool",
    "Long Tail Keyword Research Tool",
  ],
  alternates: { canonical: "/about-us" },
  openGraph: {
    title: "About Us - SeoGenieAI | Best SEO Tools for Small Businesses",
    description:
      "Learn about SeoGenieAI, the best SEO content writing and keyword research tool for small businesses, designed to enhance your online presence and drive success.",
    url: "/about-us",
    type: "website",
  },
};

const OFFERINGS = [
  {
    title: "1. In-depth Website Analysis:",
    body: (
      <>
        Gain valuable insights into your website&apos;s performance with our{" "}
        <strong>Best SEO Tools for Small Businesses. </strong>
        We delve deep into technical SEO, content quality, and on-page optimization, to provide
        actionable data to strengthen your online presence.
      </>
    ),
  },
  {
    title: "2. AI-Powered Content Writing:",
    body: (
      <>
        Let our cutting-edge <strong>SEO Content Writing Tools</strong> assistant take the heavy
        lifting off your shoulders. Generate high-quality content ideas, overcome writer&apos;s
        block, and create compelling and informative pieces that captivate your target audience.
      </>
    ),
  },
  {
    title: "3. Keyword Research:",
    body: (
      <>
        Discover the most relevant keywords to target your ideal audience with the{" "}
        <strong>Best SEO Keyword Research Tool</strong>. Identify high-performing keywords, analyze
        search intent, and optimize your content for maximum visibility.
      </>
    ),
  },
  {
    title: "4. Seamless Integration:",
    body: (
      <>
        SeoGenieAI seamlessly integrates with your existing workflow, making content creation a
        breeze. Our user-friendly interface allows you to effortlessly analyze your website,
        generate content ideas, and refine your writing within a single platform.
      </>
    ),
  },
];

export default function AboutUsPage() {
  return (
    <Wrapper>
      <Wrapper className="mb-10 mt-16 max-sm-tab:mt-0">
        <Container className="items-center flex justify-between max-md-tab:flex-col-reverse">
          <Wrapper className="max-w-[50%] max-md-tab:max-w-full">
            <h1 className="text-5xl font-semibold leading-tight tracking-tight max-xl:text-4xl max-sm-tab:text-2xl">
              <span className="text-dark-100 font-bold">SeoGenieAI:</span> Your All-in-One Best SEO
              Tools for Small Businesses and SEO Content Writing Tools
            </h1>
            <p className="mt-5 text-lg">
              <strong>Crafted by Devopmind, </strong>
              <span>
                SeoGenieAI is a revolutionary tool designed to empower businesses and content
                creators with the ultimate website analysis and content writing tool. We understand
                the ever-evolving digital landscape and the constant struggle to stay ahead of the
                curve. SeoGenieAI is your one-stop solution for crafting high-quality content that
                resonates with your audience and ranks organically in search engines.
              </span>
            </p>
          </Wrapper>
          <Wrapper className="max-w-[40%] max-md-tab:max-w-full">
            <Image
              alt="SEO analysis illustration"
              src="/images/SEO Analysis.png"
              width={800}
              height={800}
              priority
            />
          </Wrapper>
        </Container>
      </Wrapper>
      <Wrapper className="border-y border-dark-100 py-16">
        <Container>
          <Wrapper className="flex justify-between max-sm-tab:flex-col gap-5">
            <Wrapper className="flex-1">
              <h2 className="text-4xl leading-[29.08px] tracking-[-0.01em] font-semibold">
                What We Offer:
              </h2>
            </Wrapper>
            <Wrapper className="space-y-8 flex-[2]">
              {OFFERINGS.map((item) => (
                <Wrapper key={item.title}>
                  <h3 className="text-xl font-semibold mb-2 relative">{item.title}</h3>
                  <Text className="text-base leading-tight!">{item.body}</Text>
                </Wrapper>
              ))}
            </Wrapper>
          </Wrapper>
        </Container>
      </Wrapper>
      <Container>
        <Wrapper className="flex py-16 max-md-tab:flex-col max-md-tab:gap-16">
          <Wrapper className="pr-12 max-md-tab:pr-0">
            <h2 className="text-2xl font-semibold mb-2 relative text-center">
              The Devopmind Difference:
            </h2>
            <Text className="text-base leading-snug! text-center">
              Developed by the experts behind Devopmind, SeoGenieAI is built upon a foundation of
              innovation and expertise. We are a team of passionate developers and SEO professionals
              dedicated to providing cutting-edge solutions that empower your online success.
            </Text>
          </Wrapper>
          <Wrapper className="pl-12 max-md-tab:pl-0">
            <h2 className="text-2xl font-semibold mb-2 relative text-center">
              Join the SeoGenieAI Revolution:
            </h2>
            <Text className="text-base leading-snug! text-center">
              Stop struggling with website analysis and content creation! Let SeoGenieAI be your
              partner in achieving online dominance. With our powerful tools and intuitive
              interface, you can create high-performing content that drives traffic, boosts
              engagement, and propels your website to the top of search engine results.
            </Text>
          </Wrapper>
        </Wrapper>
      </Container>
    </Wrapper>
  );
}

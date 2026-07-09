import Link from "next/link";
import { Wrapper } from "@/components/ui/primitives";
import { FaqAccordion } from "./faq-accordion";

/* eslint-disable @typescript-eslint/no-explicit-any */
type KV = { key: string; value: string };

function KeyValueList({ items }: { items?: KV[] }) {
  if (!items?.length) return null;
  return (
    <Wrapper>
      {items.map((d) => (
        <Wrapper key={d.key} className="gap-2 my-3">
          <h3 className="text-[20px] font-semibold leading-[26.44px] tracking-[-0.01em]">
            {d.key}
          </h3>
          <ul className="list-disc">
            <li className="text-lg ml-8">{d.value}</li>
          </ul>
        </Wrapper>
      ))}
    </Wrapper>
  );
}

const SUBHEADING = "text-4xl font-semibold leading-tight tracking-tight max-sm-tab:text-2xl";

/** Renders the keyed content blocks (key1..key4) from a services-data entry. */
export function ServiceSections({ data }: { data: Record<string, any> }) {
  return (
    <>
      <Wrapper className="max-md-tab:max-w-full">
        <h1 className="text-4xl font-bold leading-tight tracking-tight max-sm-tab:text-2xl">
          {data.key1_h1}
        </h1>
        {data.key1_desc1 && <p className="mt-5 text-lg">{data.key1_desc1}</p>}
        {data.key1_h2 && <h2 className={`mt-3 ${SUBHEADING}`}>{data.key1_h2}</h2>}
        {data.key1_desc2 && <p className="mt-5 text-lg whitespace-pre-line">{data.key1_desc2}</p>}
        <KeyValueList items={data.key1_data} />
      </Wrapper>
      <br />
      <Wrapper className="max-md-tab:max-w-full">
        {data.key2_h1 && <h2 className={SUBHEADING}>{data.key2_h1}</h2>}
        {data.key2_desc1 && <p className="mt-5 text-lg">{data.key2_desc1}</p>}
        {data.key2_h2 && <h2 className={`mt-3 ${SUBHEADING}`}>{data.key2_h2}</h2>}
        {data.key2_desc2 && <p className="mt-5 text-lg">{data.key2_desc2}</p>}
        <KeyValueList items={data.key2_data} />
        {data.key2_desc3 && <p className="mt-5 text-lg">{data.key2_desc3}</p>}
      </Wrapper>
      <br />
      <Wrapper className="max-md-tab:max-w-full">
        {data.key3_h1 && <h2 className={SUBHEADING}>{data.key3_h1}</h2>}
        {data.key3_desc1 && <p className="mt-5 text-lg">{data.key3_desc1}</p>}
        {typeof data.key3_h1 === "string" && /faq/i.test(data.key3_h1) ? (
          <FaqAccordion items={data.key3_data} />
        ) : (
          <KeyValueList items={data.key3_data} />
        )}
      </Wrapper>
      <Wrapper className="max-md-tab:max-w-full">
        {data.key4_h1 && <h2 className={SUBHEADING}>{data.key4_h1}</h2>}
        {data.key4_desc1 && <p className="mt-5 text-lg">{data.key4_desc1}</p>}
        {typeof data.key4_h1 === "string" && /faq/i.test(data.key4_h1) ? (
          <FaqAccordion items={data.key4_data} />
        ) : (
          <KeyValueList items={data.key4_data} />
        )}
      </Wrapper>
      {data.button && (
        <Wrapper className="mt-[3rem]">
          <Link
            href="/contact-us"
            className="w-[300px] pt-[7px] pb-2 px-[21px] text-center block text-base leading-[21.28px] font-normal rounded-[9px] border border-dark-100 transition-colors duration-300 whitespace-nowrap bg-dark-100 text-white hover:bg-transparent hover:text-dark-100"
          >
            {data.button}
          </Link>
          {data.btn_desc && <p className="mt-5 text-lg">{data.btn_desc}</p>}
        </Wrapper>
      )}
    </>
  );
}

/** FAQPage JSON-LD from whichever keyN_data block is the FAQ list. */
export function faqJsonLd(data: Record<string, any>): object | null {
  const faqBlock: KV[] | undefined =
    (typeof data.key3_h1 === "string" && /faq/i.test(data.key3_h1) && data.key3_data) ||
    (typeof data.key4_h1 === "string" && /faq/i.test(data.key4_h1) && data.key4_data) ||
    undefined;
  if (!faqBlock?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqBlock.map((f) => ({
      "@type": "Question",
      name: f.key.trim(),
      acceptedAnswer: { "@type": "Answer", text: f.value },
    })),
  };
}

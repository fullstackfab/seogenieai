import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/primitives";

export function Welcome() {
  return (
    <Container>
      <div className="grid grid-cols-1  gap-10 items-center pt-10 pb-12 max-md-mobile:pt-6 max-md-mobile:pb-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dark-100/20 bg-dark-100/5 px-3 py-1.5 text-[13px] font-medium text-dark-100">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            AI-Powered SEO Suite
          </span>
          <h1 className="text-[#171717] text-center mt-5 text-[40px] font-bold leading-[1.15] tracking-[-0.01em] max-md-mobile:text-[28px]">
            Smart SEO Solutions
            <br />
            for <span className="text-dark-100">Real Results</span>
          </h1>
          <p className="mt-4 text-[16px] text-center text-[#475569] max-w-130">
            Boost your website rankings, drive more traffic, and grow your business with our
            AI-powered SEO tools.
          </p>
        </div>
      </div>
    </Container>
  );
}

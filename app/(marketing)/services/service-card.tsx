import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import type { ServiceEntry } from "@/lib/services-data";

export function ServiceCard({ service }: { service: ServiceEntry }) {
  return (
    <article className="relative flex max-w-[24rem] flex-col overflow-hidden rounded-xl bg-white text-gray-700 shadow-md">
      <div className="relative m-0 overflow-hidden bg-transparent h-[250px]">
        <Image
          src={service.icon}
          alt={service.title}
          width={384}
          height={250}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-6">
        <h3 className="block text-xl antialiased font-semibold leading-snug tracking-normal">
          {service.title}
        </h3>
        <p className="block mt-3 antialiased font-normal leading-relaxed text-gray-700">
          {service.description}
        </p>
      </div>
      <div className="p-6 pt-0">
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-center text-gray-900 uppercase align-middle transition-all rounded-lg select-none hover:bg-gray-900/10 active:bg-gray-900/20"
        >
          Learn More
          <MoveRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

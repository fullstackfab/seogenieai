import { H4 } from "@/components/ui/typography";

export function Processing({ heading }: { heading?: string }) {
  return (
    <div>
      <div className="flex space-x-2 justify-center items-center mb-4 ">
        <span className="sr-only">Loading...</span>
        <div className="h-4 w-4 bg-dark-100 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="h-4 w-4 bg-dark-100 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="h-4 w-4 bg-dark-100 rounded-full animate-bounce" />
      </div>
      <H4 className="text-center text-2xl! uppercase text-dark-100">
        {heading ?? "PROCESSING Data"}
      </H4>
    </div>
  );
}

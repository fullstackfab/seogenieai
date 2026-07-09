import { Container } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactUsLoading() {
  return (
    <Container>
      <div className="max-w-[800px] mx-auto mt-16 mb-16">
        <Skeleton className="h-9 w-52 mx-auto mb-8" />

        <div className="md:flex items-center gap-8">
          <div className="md:w-[50%] w-full">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-13 w-full rounded-[10px]" />
          </div>
          <div className="md:w-[50%] w-full mt-5 md:mt-0">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-13 w-full rounded-[10px]" />
          </div>
        </div>

        <div className="md:flex items-center gap-8 mt-5">
          <div className="md:w-[50%] w-full">
            <Skeleton className="h-4 w-40 mb-3" />
            <Skeleton className="h-13 w-full rounded-[10px]" />
          </div>
          <div className="md:w-[50%] w-full mt-5 md:mt-0">
            <Skeleton className="h-4 w-40 mb-3" />
            <Skeleton className="h-13 w-full rounded-[10px]" />
          </div>
        </div>

        <Skeleton className="h-4 w-56 mb-3 mt-5" />
        <Skeleton className="h-13 w-full rounded-[10px]" />

        <Skeleton className="h-4 w-28 mb-3 mt-5" />
        <Skeleton className="h-38 w-full rounded-[10px]" />

        <Skeleton className="h-13 w-full rounded-[9px] mt-6" />
      </div>
    </Container>
  );
}

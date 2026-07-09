import { Container, Wrapper } from "@/components/ui/primitives";
import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <Wrapper>
      <Wrapper className="mb-10 mt-16 max-sm-tab:mt-0">
        <Container className="items-center flex justify-center max-md-tab:flex-col-reverse">
          <Wrapper className="max-w-[55%] max-md-tab:max-w-full w-full">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3 mt-2" />
            <SkeletonLines lines={2} className="mt-5" />
          </Wrapper>
        </Container>
      </Wrapper>

      <Wrapper className="mb-10 mt-16 max-sm-tab:mt-0">
        <Container className="items-center flex justify-center">
          <Wrapper className="w-full">
            <Skeleton className="h-8 w-72 mx-auto my-8" />
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white overflow-hidden shadow-md">
                  <Skeleton className="w-full h-[250px] rounded-none" />
                  <div className="p-6">
                    <Skeleton className="h-5 w-3/4" />
                    <SkeletonLines lines={2} className="mt-3" />
                  </div>
                </div>
              ))}
            </div>
          </Wrapper>
        </Container>
      </Wrapper>
    </Wrapper>
  );
}

import { Container, Wrapper } from "@/components/ui/primitives";
import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";

export default function AboutUsLoading() {
  return (
    <Wrapper>
      <Wrapper className="mb-10 mt-16 max-sm-tab:mt-0">
        <Container className="items-center flex justify-between gap-8 max-md-tab:flex-col-reverse">
          <Wrapper className="max-w-[50%] max-md-tab:max-w-full w-full">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4 mt-2" />
            <SkeletonLines lines={3} className="mt-5" />
          </Wrapper>
          <Wrapper className="max-w-[40%] max-md-tab:max-w-full w-full">
            <Skeleton className="w-full aspect-square rounded-xl" />
          </Wrapper>
        </Container>
      </Wrapper>

      <Wrapper className="border-y border-dark-100/20 py-16">
        <Container>
          <Wrapper className="flex justify-between max-sm-tab:flex-col gap-5">
            <Wrapper className="flex-1">
              <Skeleton className="h-8 w-40" />
            </Wrapper>
            <Wrapper className="space-y-8 flex-[2]">
              {Array.from({ length: 4 }).map((_, i) => (
                <Wrapper key={i}>
                  <Skeleton className="h-5 w-56 mb-3" />
                  <SkeletonLines lines={2} />
                </Wrapper>
              ))}
            </Wrapper>
          </Wrapper>
        </Container>
      </Wrapper>

      <Container>
        <Wrapper className="flex py-16 max-md-tab:flex-col max-md-tab:gap-16 gap-8">
          <Wrapper className="flex-1">
            <Skeleton className="h-6 w-64 mx-auto mb-4" />
            <SkeletonLines lines={3} />
          </Wrapper>
          <Wrapper className="flex-1">
            <Skeleton className="h-6 w-64 mx-auto mb-4" />
            <SkeletonLines lines={3} />
          </Wrapper>
        </Wrapper>
      </Container>
    </Wrapper>
  );
}

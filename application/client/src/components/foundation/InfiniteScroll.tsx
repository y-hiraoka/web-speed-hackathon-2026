import { ReactNode, useCallback, useRef } from "react";

interface Props {
  children: ReactNode;
  fetchMore: () => void;
}

export const InfiniteScroll = ({ children, fetchMore }: Props) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (node == null) {
        return;
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            fetchMore();
          }
        },
        { rootMargin: "0px 0px 800px 0px" },
      );

      observerRef.current.observe(node);
    },
    [fetchMore],
  );

  return (
    <>
      {children}
      <div ref={sentinelRef} />
    </>
  );
};

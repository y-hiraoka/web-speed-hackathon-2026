import { RefObject, useEffect, useState } from "react";

/**
 * contentEndRef の要素が boundaryRef の要素より下にあるかを監視する。
 * 例: コンテンツ末尾がスティッキーバーより下にあるとき true を返す。
 *
 * @param contentEndRef - コンテンツの末尾を示す要素の ref
 * @param boundaryRef - 比較対象となる境界要素の ref（例: sticky な入力欄）
 */
export function useHasContentBelow(
  contentEndRef: RefObject<HTMLElement | null>,
  boundaryRef: RefObject<HTMLElement | null>,
): boolean {
  const [hasContentBelow, setHasContentBelow] = useState(false);

  useEffect(() => {
    const endEl = contentEndRef.current;
    const barEl = boundaryRef.current;
    if (!endEl || !barEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // When the end element is not intersecting and is below the viewport,
          // it means there is content below the boundary.
          // We check boundingClientRect.top > 0 to confirm it's below (not above).
          setHasContentBelow(!entry.isIntersecting && entry.boundingClientRect.top > 0);
        }
      },
      {
        root: null,
        threshold: 0,
      },
    );

    observer.observe(endEl);

    return () => {
      observer.disconnect();
    };
  }, [contentEndRef, boundaryRef]);

  return hasContentBelow;
}

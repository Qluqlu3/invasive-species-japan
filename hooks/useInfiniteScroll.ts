'use client';

import { useEffect, useRef } from 'react';

/**
 * hasMoreの間、返されたref要素が画面近くに来たらonLoadMoreを呼ぶ無限スクロール用フック。
 * onLoadMoreは常に最新のものを呼ぶため、依存配列に含める必要はない。
 */
export function useInfiniteScroll(hasMore: boolean, onLoadMore: () => void) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  return sentinelRef;
}

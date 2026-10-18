'use client';

import { useCallback } from 'react';
import { parseStringArray, useLocalStorageState } from './useLocalStorageState';

const STORAGE_KEY = 'invasive:recently-viewed';
const MAX_ITEMS = 5;
const EMPTY: string[] = [];

/**
 * 直近に閲覧した種のIDをlocalStorageに保存するフック（新しい順、最大MAX_ITEMS件）。
 * SSR/初回レンダリング時は空配列を返し、hydration後にlocalStorageの内容へ差し替わる。
 */
export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useLocalStorageState(
    STORAGE_KEY,
    parseStringArray,
    EMPTY,
  );

  const recordView = useCallback(
    (id: string) => {
      setRecentlyViewed((prev) =>
        [id, ...prev.filter((existing) => existing !== id)].slice(0, MAX_ITEMS),
      );
    },
    [setRecentlyViewed],
  );

  return { recentlyViewed, recordView };
}

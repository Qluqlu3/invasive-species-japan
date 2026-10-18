'use client';

import { useCallback, useMemo } from 'react';
import { parseStringArray, useLocalStorageState } from './useLocalStorageState';

const STORAGE_KEY = 'invasive:favorites';
const EMPTY: string[] = [];

/**
 * お気に入り登録した種のIDをlocalStorageに保存するフック。
 * SSR/初回レンダリング時は空集合を返し、hydration後にlocalStorageの内容へ差し替わる。
 */
export function useFavorites() {
  const [ids, setIds] = useLocalStorageState(
    STORAGE_KEY,
    parseStringArray,
    EMPTY,
  );
  const favorites = useMemo(() => new Set(ids), [ids]);

  const toggleFavorite = useCallback(
    (id: string) => {
      setIds((prev) =>
        prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
      );
    },
    [setIds],
  );

  return { favorites, toggleFavorite };
}

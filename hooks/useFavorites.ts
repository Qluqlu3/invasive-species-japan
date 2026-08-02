'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'invasive:favorites';

function readFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * お気に入り登録した種のIDをlocalStorageに保存するフック。
 * SSR/初回レンダリング時は空集合を返し、マウント後にlocalStorageの内容へ
 * 差し替える（サーバー・クライアントでの内容差異によるhydrationエラーを避けるため）。
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}

'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'invasive:recently-viewed';
const MAX_ITEMS = 5;

function readRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string')
      : [];
  } catch {
    return [];
  }
}

/**
 * 直近に閲覧した種のIDをlocalStorageに保存するフック（新しい順、最大MAX_ITEMS件）。
 * SSR/初回レンダリング時は空配列を返し、マウント後にlocalStorageの内容へ
 * 差し替える（サーバー・クライアントでの内容差異によるhydrationエラーを避けるため）。
 */
export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    setRecentlyViewed(readRecentlyViewed());
  }, []);

  const recordView = useCallback((id: string) => {
    setRecentlyViewed((prev) => {
      const next = [id, ...prev.filter((existing) => existing !== id)].slice(
        0,
        MAX_ITEMS,
      );
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recentlyViewed, recordView };
}

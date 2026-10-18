'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';

/** 同一タブ内で同じキーを購読しているフックへ変更を通知するためのリスナー */
const listenersByKey = new Map<string, Set<() => void>>();

function notify(key: string) {
  for (const listener of listenersByKey.get(key) ?? []) listener();
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // プライベートモード等でlocalStorageにアクセスできない場合
    return null;
  }
}

/** JSONとして読んだ値が文字列配列ならそのまま、そうでなければnullを返す */
export function parseStringArray(value: unknown): string[] | null {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : null;
}

/**
 * localStorageにJSONで保存する状態を、useSyncExternalStoreで購読するフック。
 * 同じキーを使う複数のフック（同一タブ内）や別タブ（storageイベント）の変更にも追従する。
 *
 * SSR/hydration時はfallbackを返し、hydration後にlocalStorageの値へ差し替わる
 * （サーバー・クライアントでの内容差異によるhydrationエラーを避けるため）。
 *
 * @param parse JSON.parse後の値を検証して型Tに変換する。不正な値ならnullを返す
 * @param fallback 未保存・不正な値のときに返す値。毎レンダリング同じ参照を渡すこと
 */
export function useLocalStorageState<T>(
  key: string,
  parse: (value: unknown) => T | null,
  fallback: T,
): [T, (update: (prev: T) => T) => void] {
  // getSnapshotは同じ内容に対して同じ参照を返す必要があるため、生の文字列単位でキャッシュする
  const cacheRef = useRef<{ raw: string | null; value: T } | null>(null);

  const getSnapshot = useCallback((): T => {
    const raw = readRaw(key);
    const cache = cacheRef.current;
    if (cache && cache.raw === raw) return cache.value;

    let value = fallback;
    if (raw !== null) {
      try {
        value = parse(JSON.parse(raw)) ?? fallback;
      } catch {
        // 壊れたJSONはfallback扱いにする
      }
    }
    cacheRef.current = { raw, value };
    return value;
  }, [key, parse, fallback]);

  const subscribe = useCallback(
    (onChange: () => void) => {
      const listeners = listenersByKey.get(key) ?? new Set();
      listeners.add(onChange);
      listenersByKey.set(key, listeners);

      const onStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) onChange();
      };
      window.addEventListener('storage', onStorage);

      return () => {
        listeners.delete(onChange);
        window.removeEventListener('storage', onStorage);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);

  const update = useCallback(
    (updater: (prev: T) => T) => {
      const next = updater(getSnapshot());
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // 容量超過・プライベートモード等で保存できない場合は何もしない
        return;
      }
      notify(key);
    },
    [key, getSnapshot],
  );

  return [value, update];
}

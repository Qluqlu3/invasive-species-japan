import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { parseStringArray, useLocalStorageState } from './useLocalStorageState';

const KEY = 'test:ids';
const EMPTY: string[] = [];

function useIds() {
  return useLocalStorageState(KEY, parseStringArray, EMPTY);
}

describe('useLocalStorageState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('未保存の場合はfallbackを返す', () => {
    const { result } = renderHook(() => useIds());
    expect(result.current[0]).toBe(EMPTY);
  });

  it('壊れたJSONや型の合わない値はfallback扱いにする', () => {
    window.localStorage.setItem(KEY, '{broken');
    const { result, unmount } = renderHook(() => useIds());
    expect(result.current[0]).toBe(EMPTY);
    unmount();

    window.localStorage.setItem(KEY, JSON.stringify({ a: 1 }));
    const { result: result2 } = renderHook(() => useIds());
    expect(result2.current[0]).toBe(EMPTY);
  });

  it('配列中の文字列以外の要素は取り除く', () => {
    window.localStorage.setItem(KEY, JSON.stringify(['a', 1, null, 'b']));
    const { result } = renderHook(() => useIds());
    expect(result.current[0]).toEqual(['a', 'b']);
  });

  it('値が変わらない限り同じ参照を返す', () => {
    window.localStorage.setItem(KEY, JSON.stringify(['a']));
    const { result, rerender } = renderHook(() => useIds());
    const first = result.current[0];
    rerender();
    expect(result.current[0]).toBe(first);
  });

  it('同じキーを使う別のフックにも更新が反映される', () => {
    const a = renderHook(() => useIds());
    const b = renderHook(() => useIds());

    act(() => a.result.current[1]((prev) => [...prev, 'x']));

    expect(a.result.current[0]).toEqual(['x']);
    expect(b.result.current[0]).toEqual(['x']);
  });

  it('別タブでの変更（storageイベント）に追従する', async () => {
    const { result } = renderHook(() => useIds());

    act(() => {
      window.localStorage.setItem(KEY, JSON.stringify(['from-other-tab']));
      window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
    });

    await waitFor(() => expect(result.current[0]).toEqual(['from-other-tab']));
  });
});

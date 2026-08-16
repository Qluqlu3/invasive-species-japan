import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRecentlyViewed } from './useRecentlyViewed';

describe('useRecentlyViewed', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('初期状態は空配列', async () => {
    const { result } = renderHook(() => useRecentlyViewed());
    await waitFor(() => expect(result.current.recentlyViewed).toEqual([]));
  });

  it('recordViewで先頭に追加される', async () => {
    const { result } = renderHook(() => useRecentlyViewed());
    await waitFor(() => expect(result.current.recentlyViewed).toEqual([]));

    act(() => result.current.recordView('procyon-lotor'));
    act(() => result.current.recordView('bufo-marinus'));

    expect(result.current.recentlyViewed).toEqual([
      'bufo-marinus',
      'procyon-lotor',
    ]);
  });

  it('同じIDを再度見た場合は先頭に移動し重複しない', async () => {
    const { result } = renderHook(() => useRecentlyViewed());
    await waitFor(() => expect(result.current.recentlyViewed).toEqual([]));

    act(() => result.current.recordView('procyon-lotor'));
    act(() => result.current.recordView('bufo-marinus'));
    act(() => result.current.recordView('procyon-lotor'));

    expect(result.current.recentlyViewed).toEqual([
      'procyon-lotor',
      'bufo-marinus',
    ]);
  });

  it('最大5件を超えると古いものから切り捨てられる', async () => {
    const { result } = renderHook(() => useRecentlyViewed());
    await waitFor(() => expect(result.current.recentlyViewed).toEqual([]));

    act(() => {
      for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) {
        result.current.recordView(id);
      }
    });

    expect(result.current.recentlyViewed).toEqual(['f', 'e', 'd', 'c', 'b']);
  });

  it('localStorageに永続化され、再マウント後も復元される', async () => {
    const { result, unmount } = renderHook(() => useRecentlyViewed());
    await waitFor(() => expect(result.current.recentlyViewed).toEqual([]));
    act(() => result.current.recordView('bufo-marinus'));
    unmount();

    const { result: remounted } = renderHook(() => useRecentlyViewed());
    await waitFor(() =>
      expect(remounted.current.recentlyViewed).toEqual(['bufo-marinus']),
    );
  });
});

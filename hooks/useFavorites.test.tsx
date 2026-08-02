import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useFavorites } from './useFavorites';

describe('useFavorites', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('初期状態は空集合', async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.favorites.size).toBe(0));
  });

  it('toggleFavoriteで追加・削除できる', async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.favorites).toBeInstanceOf(Set));

    act(() => result.current.toggleFavorite('procyon-lotor'));
    expect(result.current.favorites.has('procyon-lotor')).toBe(true);

    act(() => result.current.toggleFavorite('procyon-lotor'));
    expect(result.current.favorites.has('procyon-lotor')).toBe(false);
  });

  it('localStorageに永続化され、再マウント後も復元される', async () => {
    const { result, unmount } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.favorites).toBeInstanceOf(Set));
    act(() => result.current.toggleFavorite('bufo-marinus'));
    unmount();

    const { result: remounted } = renderHook(() => useFavorites());
    await waitFor(() =>
      expect(remounted.current.favorites.has('bufo-marinus')).toBe(true),
    );
  });
});

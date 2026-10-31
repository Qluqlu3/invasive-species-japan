// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchBuffer, SCRAPER_USER_AGENT } from './http';

describe('fetchBuffer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('既定のUser-Agentでフェッチし、本文をBufferで返す', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('abc'));
    vi.stubGlobal('fetch', fetchMock);

    const buf = await fetchBuffer('https://example.com/a.jpg');

    expect(buf.toString()).toBe('abc');
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/a.jpg', {
      headers: { 'User-Agent': SCRAPER_USER_AGENT },
    });
  });

  it('User-Agentを指定できる', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('abc'));
    vi.stubGlobal('fetch', fetchMock);

    await fetchBuffer('https://example.com/a.jpg', 'custom-agent');

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/a.jpg', {
      headers: { 'User-Agent': 'custom-agent' },
    });
  });

  it('失敗レスポンスならHTTPエラーを投げる', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 404 })),
    );
    await expect(fetchBuffer('https://example.com/a.jpg')).rejects.toThrow(
      'HTTP 404',
    );
  });
});

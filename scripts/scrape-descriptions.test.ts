import { describe, expect, it, vi } from 'vitest';

vi.mock('./http', () => ({
  fetchText: vi.fn(),
  sleep: vi.fn().mockResolvedValue(undefined),
}));

import { fetchText } from './http';
import { fetchDescription, normalizePunctuation } from './scrape-descriptions';

describe('normalizePunctuation', () => {
  it('全角カンマ・ピリオドを日本語の句読点に変換する', () => {
    expect(normalizePunctuation('体長40cm．尾が長い，特徴的')).toBe(
      '体長40cm。尾が長い、特徴的',
    );
  });

  it('連続する句読点を1つにまとめる', () => {
    expect(normalizePunctuation('注意。。危険。。。')).toBe('注意。危険。');
  });

  it('末尾が読点の場合は句点に置き換える', () => {
    expect(normalizePunctuation('危険な種、')).toBe('危険な種。');
  });

  it('前後の空白を除去する', () => {
    expect(normalizePunctuation('  テキスト  ')).toBe('テキスト');
  });
});

describe('fetchDescription', () => {
  it('対象ラベルのtdの次列だけを抽出し句読点を正規化する', async () => {
    vi.mocked(fetchText).mockResolvedValue(`
      <table>
        <tr><td>英名等</td><td>Raccoon</td></tr>
        <tr><td>形態</td><td>体長40～60cm．尾は太く長い．</td></tr>
        <tr><td>非対象ラベル</td><td>無視されるべき内容</td></tr>
        <tr><td>備考</td><td></td></tr>
      </table>
    `);

    const desc = await fetchDescription('https://example.com/detail.html');

    expect(desc).toEqual({
      englishName: 'Raccoon',
      morphology: '体長40～60cm。尾は太く長い。',
    });
  });
});

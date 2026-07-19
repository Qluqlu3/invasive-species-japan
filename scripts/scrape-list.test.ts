import { describe, expect, it, vi } from 'vitest';

vi.mock('./http', () => ({
  fetchText: vi.fn(),
}));

import { fetchText } from './http';
import { scrapeList } from './scrape-list';

const FIXTURE_HTML = `
<html><body>
<p>哺乳類（1種類）</p>
<table>
  <tr>
    <td>ネコ目</td>
    <td>アライグマ科</td>
    <td>アライグマ属 Procyon</td>
    <td><a href="/nature/intro/2outline/list/raccoon.html">アライグマ（P. lotor）</a></td>
    <td>定着</td>
  </tr>
</table>
<p>昆虫類（1種類）</p>
<table>
  <tr>
    <td>コウチュウ目</td>
    <td>ゴミムシダマシ科</td>
    <td>ゴミムシダマシ属 Tenebrio</td>
    <td><a href="https://example.org/beetle.html">コクヌストモドキ (T. molitor)</a></td>
    <td>未定着</td>
  </tr>
</table>
</body></html>
`;

describe('scrapeList', () => {
  it('カテゴリ見出しの直後のテーブルから目・科・属・状況を抽出する', async () => {
    vi.mocked(fetchText).mockResolvedValue(FIXTURE_HTML);
    const result = await scrapeList();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      jaName: 'アライグマ',
      scientificName: 'Procyon lotor',
      category: '哺乳類',
      order: 'ネコ目',
      family: 'アライグマ科',
      status: '定着',
      isConditional: false,
      niesUrl: 'https://www.env.go.jp/nature/intro/2outline/list/raccoon.html',
    });
  });

  it('半角括弧の学名表記と絶対URLのリンクも解釈できる', async () => {
    vi.mocked(fetchText).mockResolvedValue(FIXTURE_HTML);
    const result = await scrapeList();

    expect(result[1]).toMatchObject({
      jaName: 'コクヌストモドキ',
      scientificName: 'Tenebrio molitor',
      category: '昆虫類',
      order: 'コウチュウ目',
      status: '未定着',
      niesUrl: 'https://example.org/beetle.html',
    });
  });
});

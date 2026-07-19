import { describe, expect, it, vi } from 'vitest';

vi.mock('./http', () => ({
  fetchText: vi.fn(),
}));

import { fetchText } from './http';
import { scrapePhotos } from './scrape-photos';

const FIXTURE_HTML = `
<table>
  <tr>
    <td>アライグマ</td>
    <td><a href="/nature/intro/4document/files/asimg/raccoon1.jpg"><img src="/nature/intro/4document/files/asimg/raccoon1_s.jpg"></a></td>
  </tr>
  <tr>
    <td>アライグマ</td>
    <td><a href="/nature/intro/4document/files/asimg/raccoon2.jpg"><img src="/nature/intro/4document/files/asimg/raccoon2_s.jpg"></a></td>
  </tr>
  <tr>
    <td>サムネイルのみ</td>
    <td><img src="/nature/intro/4document/files/asimg/thumbonly_s.jpg"></td>
  </tr>
  <tr>
    <td>目次|見出し</td>
    <td><a href="/x.jpg"><img src="/x_s.jpg"></a></td>
  </tr>
  <tr>
    <td>単独セル</td>
  </tr>
</table>
`;

describe('scrapePhotos', () => {
  it('同一種名の画像URLをマージする', async () => {
    vi.mocked(fetchText).mockResolvedValue(FIXTURE_HTML);
    const result = await scrapePhotos();

    expect(result.get('アライグマ')).toEqual([
      'https://www.env.go.jp/nature/intro/4document/files/asimg/raccoon1.jpg',
      'https://www.env.go.jp/nature/intro/4document/files/asimg/raccoon2.jpg',
    ]);
  });

  it('サムネイルしか無い種と見出し行・単独セル行は除外する', async () => {
    vi.mocked(fetchText).mockResolvedValue(FIXTURE_HTML);
    const result = await scrapePhotos();

    expect(result.has('サムネイルのみ')).toBe(false);
    expect(result.has('目次|見出し')).toBe(false);
    expect(result.has('単独セル')).toBe(false);
    expect(result.size).toBe(1);
  });
});

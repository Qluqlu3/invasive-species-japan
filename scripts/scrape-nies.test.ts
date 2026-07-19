import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_PREFECTURES } from '../lib/types';

vi.mock('./http', () => ({
  fetchText: vi.fn(),
  sleep: vi.fn().mockResolvedValue(undefined),
}));

import { fetchText } from './http';
import {
  extractPrefectures,
  scrapeNies,
  scrapeNiesDetails,
} from './scrape-nies';

beforeEach(() => {
  vi.mocked(fetchText).mockReset();
});

describe('extractPrefectures', () => {
  it('「全国」を含む場合は全都道府県を返す', () => {
    expect(extractPrefectures('全国的に分布')).toEqual([...ALL_PREFECTURES]);
  });

  it('個別の都道府県名を抽出する（ALL_PREFECTURESの並び順で返す）', () => {
    expect(extractPrefectures('東京、北海道に分布')).toEqual([
      '北海道',
      '東京',
    ]);
  });

  it('「神奈川」と「奈良」を誤検出せずそれぞれ判定する', () => {
    expect(extractPrefectures('神奈川県に分布')).toEqual(['神奈川']);
    expect(extractPrefectures('奈良県に分布')).toEqual(['奈良']);
  });

  it('該当する都道府県がなければ空配列を返す', () => {
    expect(extractPrefectures('詳細不明')).toEqual([]);
  });
});

const TOC_PAGE_FIXTURE = `
<table>
  <tr>
    <td>哺乳類</td>
    <td><a href="detail1.html">アライグマ [Procyon lotor]</a></td>
    <td>特定</td>
    <td>国外</td>
    <td>北海道、東京</td>
  </tr>
  <tr>
    <td>哺乳類</td>
    <td>タヌキ [Nyctereutes procyonoides]</td>
    <td>対象外</td>
    <td>国内</td>
    <td>全国</td>
  </tr>
</table>
`;

describe('scrapeNies', () => {
  it('法的扱いが「特定」の種のみを収集し、複数ページで分布をマージする', async () => {
    vi.mocked(fetchText).mockResolvedValue(TOC_PAGE_FIXTURE);
    const result = await scrapeNies();

    expect(result.has('タヌキ')).toBe(false);
    const raccoon = result.get('アライグマ');
    expect(raccoon).toMatchObject({
      scientificName: 'Procyon lotor',
      isInvasive: true,
      prefectures: ['北海道', '東京'],
      niesDetailUrl:
        'https://www.nies.go.jp/biodiversity/invasive/DB/detail1.html',
    });
  });
});

describe('scrapeNiesDetails', () => {
  it('「国内移入分布」ラベルの次列から都道府県を抽出する', async () => {
    vi.mocked(fetchText).mockResolvedValueOnce(
      '<table><tr><td>国内移入分布</td><td>沖縄、鹿児島</td></tr></table>',
    );
    const result = await scrapeNiesDetails([
      'https://example.com/detail1.html',
    ]);

    expect(result.get('https://example.com/detail1.html')).toEqual([
      '鹿児島',
      '沖縄',
    ]);
  });

  it('取得に失敗したURLはスキップし、他のURLの処理は継続する', async () => {
    vi.mocked(fetchText)
      .mockRejectedValueOnce(new Error('HTTP 500'))
      .mockResolvedValueOnce(
        '<table><tr><td>国内移入分布</td><td>東京</td></tr></table>',
      );
    const result = await scrapeNiesDetails([
      'https://example.com/fail.html',
      'https://example.com/ok.html',
    ]);

    expect(result.has('https://example.com/fail.html')).toBe(false);
    expect(result.get('https://example.com/ok.html')).toEqual(['東京']);
  });
});

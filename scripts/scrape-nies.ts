/**
 * scrape-nies.ts
 * NIES 侵入生物データベースの各分類群TOCページから
 * 特定外来生物の「国内移入分布」テキストを取得し、都道府県を抽出する
 * https://www.nies.go.jp/biodiversity/invasive/DB/
 */
import * as cheerio from 'cheerio';
import { ALL_PREFECTURES } from './types';

const NIES_BASE = 'https://www.nies.go.jp/biodiversity/invasive/DB/';
const TOC_PAGES: { path: string; category: string }[] = [
  { path: 'toc1_mammals.html', category: '哺乳類' },
  { path: 'toc2_birds.html', category: '鳥類' },
  { path: 'toc3_reptiles.html', category: '爬虫類' },
  { path: 'toc4_amphibians.html', category: '両生類' },
  { path: 'toc5_fishes.html', category: '魚類' },
  { path: 'toc6_insects.html', category: '昆虫類' },
  { path: 'toc7_invertebrates.html', category: 'その他の無脊椎動物' },
  { path: 'toc8_plants.html', category: '植物' },
];
const DELAY_MS = 1500;

export interface NiesEntry {
  jaName: string;
  scientificName: string;
  isInvasive: boolean; // 法的扱い = "特定"
  distribution: string; // 国内移入分布テキスト
  prefectures: string[]; // 抽出された都道府県
  niesDetailUrl?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 分布テキストから都道府県名を抽出する */
export function extractPrefectures(text: string): string[] {
  const lower = text.replace(/\s/g, '');

  // "全国" or "ほぼ全国" は全都道府県
  if (lower.includes('全国')) return [...ALL_PREFECTURES];

  const found: string[] = [];
  for (const pref of ALL_PREFECTURES) {
    // 都道府県名（例: 北海道, 沖縄, 東京）がテキスト中に含まれるか
    // 注意: 「神奈川」より前に「奈良」がマッチしないよう長い名前を先に検索
    if (lower.includes(pref)) {
      found.push(pref);
    }
  }
  return found;
}

/** NIESのTOCページを1つ処理して NiesEntry[] を返す */
async function scrapeTocPage(path: string): Promise<NiesEntry[]> {
  const url = NIES_BASE + path;
  console.log(`[scrape-nies] フェッチ中: ${url}`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (invasive-species-viewer/1.0; research)',
    },
  });
  if (!res.ok) {
    console.warn(`  → HTTP ${res.status}, スキップ`);
    return [];
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const entries: NiesEntry[] = [];

  // TOCページのテーブル構造:
  // | 高次分類群 | 和名[学名] | 法的扱い | 由来 | 国内移入分布 |
  $('table tr').each((_, tr) => {
    const cells = $('td', tr);
    if (cells.length < 5) return;

    // 列インデックス: 0=分類, 1=名前, 2=法的扱い, 3=由来, 4=分布
    const nameCell = cells.eq(1);
    const legalCell = cells.eq(2);
    const distCell = cells.eq(4);

    const nameText = nameCell.text().replace(/\s+/g, ' ').trim();
    const legal = legalCell.text().trim();
    const distribution = distCell.text().replace(/\s+/g, ' ').trim();

    if (!nameText) return;

    // 和名と学名を分離: "アライグマ [Procyon lotor]" or "アライグマ   [Procyon lotor]"
    const nameParts = nameText.match(/^(.+?)\s*[\[【]([^\]】]+)[\]】]/);
    const jaName = nameParts
      ? nameParts[1].trim()
      : nameText.replace(/\[.+?\]/g, '').trim();
    const sciName = nameParts ? nameParts[2].trim() : '';

    // 詳細ページURL
    const detailHref = nameCell.find('a').first().attr('href') ?? '';
    const niesDetailUrl = detailHref
      ? detailHref.startsWith('http')
        ? detailHref
        : NIES_BASE + detailHref.replace(/^.*\/DB\//, '')
      : undefined;

    const isInvasive = legal.includes('特定');
    const prefectures = extractPrefectures(distribution);

    entries.push({
      jaName,
      scientificName: sciName,
      isInvasive,
      distribution,
      prefectures,
      niesDetailUrl,
    });
  });

  return entries;
}

/** 全TOCページからNIESデータを取得して 和名→エントリ のMapを返す */
export async function scrapeNies(): Promise<Map<string, NiesEntry>> {
  const map = new Map<string, NiesEntry>();

  for (const { path } of TOC_PAGES) {
    const entries = await scrapeTocPage(path);
    for (const e of entries) {
      // 特定外来生物のみマップに登録（重複時は分布情報をマージ）
      if (!e.isInvasive) continue;
      const existing = map.get(e.jaName);
      if (existing) {
        const merged = new Set([...existing.prefectures, ...e.prefectures]);
        existing.prefectures = [...merged];
      } else {
        map.set(e.jaName, e);
      }
    }
    await sleep(DELAY_MS);
  }

  console.log(`[scrape-nies] 特定外来生物エントリ数: ${map.size}`);
  return map;
}

/** NIES詳細ページを個別にフェッチして「国内移入分布」テキストから都道府県を取得 */
export async function scrapeNiesDetails(
  urls: string[],
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  const total = urls.length;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[scrape-nies-detail] (${i + 1}/${total}) ${url}`);

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (invasive-species-viewer/1.0; research)',
        },
      });
      if (!res.ok) {
        console.warn(`  → HTTP ${res.status}`);
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // 「国内移入分布」ラベルの次の td からテキストを取得
      let distText = '';
      $('td').each((_, el) => {
        if ($(el).text().trim() === '国内移入分布') {
          distText = $(el).next('td').text().replace(/\s+/g, ' ').trim();
          return false; // break
        }
      });

      if (distText) {
        result.set(url, extractPrefectures(distText));
      }
    } catch (e) {
      console.warn(`  エラー: ${e}`);
    }

    if (i < urls.length - 1) await sleep(DELAY_MS);
  }

  return result;
}

// 単体実行
if (require.main === module) {
  scrapeNies().then((map) => {
    let count = 0;
    for (const [name, entry] of map) {
      if (count++ >= 5) break;
      console.log(name, entry.prefectures.slice(0, 5));
    }
  });
}

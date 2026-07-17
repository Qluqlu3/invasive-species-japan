/**
 * scrape-kouji.ts
 * 環境省「新法に基づく防除の公示一覧」から、防除の公示・確認・認定を
 * 受けた主体（自治体・省庁・NPO等）の情報を取得する
 * https://www.env.go.jp/nature/intro/3control/kouji.html
 */
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import type { ControlAuthorization } from '../lib/types';
import { normalize } from './species-matching';

const KOUJI_URL = 'https://www.env.go.jp/nature/intro/3control/kouji.html';

export interface KoujiEntry {
  speciesText: string; // 種類欄の原文（複数種がまとめて記載されていることがある）
  type: string; // 公示 | 確認 | 認定
  organization: string; // 主体名
  region: string; // 地方区分（北海道地方 等）
  area: string; // 区域
  period: string; // 期間
  objective: string; // 防除の目標
  method: string; // 防除の内容
  ministry: string; // 主務大臣
  sourceUrl: string; // 出典（地方区分のアンカー付き）
}

/** <br> をスペースに変換してからテキストを取り出す（複数行セル用） */
function cellText($: cheerio.CheerioAPI, td: Element): string {
  const clone = $(td).clone();
  clone.find('br').replaceWith(' ');
  return clone.text().replace(/\s+/g, ' ').trim();
}

/** kouji.html をスクレイピングして全 KoujiEntry を返す */
export async function scrapeKouji(): Promise<KoujiEntry[]> {
  console.log(`[scrape-kouji] フェッチ中: ${KOUJI_URL}`);

  const res = await fetch(KOUJI_URL, {
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

  const entries: KoujiEntry[] = [];
  let region = { name: '不明', anchor: '' };

  // ページは「地方区分の見出し(li.chiiki) → その地方のtable」の繰り返しになっている。
  // 出現順に走査し、直近に見た地方見出しを各テーブルの地方名として使う。
  $('li.chiiki, table.kouji').each((_, el) => {
    if ($(el).is('li.chiiki')) {
      const name = $(el)
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .trim()
        .replace(/[＜＞]/g, '');
      region = { name, anchor: $(el).attr('id') ?? '' };
      return;
    }

    const currentRegion = region;
    $(el)
      .find('tbody tr')
      .each((_, tr) => {
        const tds = $(tr).find('td').toArray();
        if (tds.length < 8) return; // 分類群の見出し行（th colspan=8）はスキップ

        const cells = tds.map((td) => cellText($, td));
        entries.push({
          speciesText: cells[0],
          type: cells[1],
          organization: cells[2],
          region: currentRegion.name,
          area: cells[3],
          period: cells[4],
          objective: cells[5],
          method: cells[6],
          ministry: cells[7],
          sourceUrl: currentRegion.anchor
            ? `${KOUJI_URL}#${currentRegion.anchor}`
            : KOUJI_URL,
        });
      });
  });

  return entries;
}

/**
 * kouji.html特有の言い回しゆれ（species.jsonの和名とは一致しないが同一種を指すもの）を補正する。
 */
const SEGMENT_ALIASES: Record<string, string> = {
  オオサンショウウオ属に属する種とオオサンショウウオ属に属する他の種の交雑により生じた生物:
    'オオサンショウウオ属に属する種間の交雑により生じた生物',
  'アゾルラ・クリスタタ': 'アゾラ・クリスタータ',
};

/**
 * KoujiEntryの「種類」欄（複数種がまとめて記載されていることがある）を
 * 既存の特定外来生物リストの和名と突き合わせる。
 * 完全一致 → 正規化一致 → エイリアス → 部分一致の順に試す。
 */
export function matchKoujiEntries(
  entries: KoujiEntry[],
  species: { id: string; jaName: string }[],
): Map<string, ControlAuthorization[]> {
  const result = new Map<string, ControlAuthorization[]>();

  for (const entry of entries) {
    const segments = entry.speciesText
      .split(/[、,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const s of species) {
      const matched = segments.some((seg) => {
        if (seg === s.jaName) return true;
        if (normalize(seg) === normalize(s.jaName)) return true;
        if (SEGMENT_ALIASES[seg] === s.jaName) return true;
        return seg.includes(s.jaName) || s.jaName.includes(seg);
      });
      if (!matched) continue;

      const list = result.get(s.id) ?? [];
      list.push({
        type: entry.type,
        organization: entry.organization,
        region: entry.region,
        area: entry.area,
        period: entry.period,
        objective: entry.objective,
        sourceUrl: entry.sourceUrl,
      });
      result.set(s.id, list);
    }
  }

  return result;
}

// 単体実行
if (require.main === module) {
  scrapeKouji().then((entries) => {
    console.log(`取得件数: ${entries.length}`);
    for (const e of entries.slice(0, 5)) {
      console.log(e);
    }
  });
}

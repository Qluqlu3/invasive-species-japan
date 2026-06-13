/**
 * scrape-list.ts
 * 環境省「特定外来生物等一覧」ページから種基本情報を取得する
 * https://www.env.go.jp/nature/intro/2outline/list.html
 */
import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import { CATEGORIES, type Category } from './types';

const LIST_URL = 'https://www.env.go.jp/nature/intro/2outline/list.html';
const BASE_URL = 'https://www.env.go.jp';
const DELAY_MS = 1500;

export interface SpeciesBasic {
  jaName: string;
  scientificName: string;
  category: Category;
  order: string;
  family: string;
  genus: string;
  status: string;
  isConditional: boolean;
  niesUrl?: string;
}

/** rowspan を追跡しながら <tr> の全セルテキストを取得する */
function parseTableRows(
  $: cheerio.CheerioAPI,
  table: AnyNode,
): { cells: string[]; links: string[] }[] {
  const rows: { cells: string[]; links: string[] }[] = [];
  // spanContext[colIdx] = { value, linksForCell, remaining }
  const spanCtx: Array<{ value: string; link: string; remaining: number } | null> = [];

  $('tr', table).each((_, tr) => {
    const cells: string[] = [];
    const links: string[] = [];
    let colIdx = 0;

    // pending rowspan のカラムを埋める
    const fillSpans = () => {
      while (spanCtx[colIdx] && spanCtx[colIdx]!.remaining > 0) {
        cells.push(spanCtx[colIdx]!.value);
        links.push(spanCtx[colIdx]!.link);
        spanCtx[colIdx]!.remaining--;
        colIdx++;
      }
    };

    $('td, th', tr).each((_, td) => {
      fillSpans();

      const $td = $(td);
      const value = $td.text().replace(/\s+/g, ' ').trim();
      const href = $td.find('a').first().attr('href') ?? '';
      const link = href.startsWith('http') ? href : href ? BASE_URL + href : '';
      const rowspan = parseInt($td.attr('rowspan') ?? '1', 10);
      const colspan = parseInt($td.attr('colspan') ?? '1', 10);

      for (let c = 0; c < colspan; c++) {
        cells.push(value);
        links.push(link);
        if (rowspan > 1) {
          spanCtx[colIdx] = { value, link, remaining: rowspan - 1 };
        } else {
          spanCtx[colIdx] = null;
        }
        colIdx++;
      }
    });

    // 行末の残 rowspan を埋める
    fillSpans();

    if (cells.length > 0) {
      rows.push({ cells, links });
    }
  });

  return rows;
}

/** "フクロギツネ（T. vulpecula）" → { jaName: "フクロギツネ", sciAbbrev: "T. vulpecula" } */
function parseSpeciesCell(text: string): { jaName: string; sciAbbrev: string } {
  const fullIdx = text.indexOf('（');
  const halfIdx = text.indexOf('(');

  // 先に現れた括弧種を優先する（例: "和名 (A. xxx) （注記）" → 半角を先に処理）
  if (fullIdx >= 0 && (halfIdx < 0 || fullIdx < halfIdx)) {
    const endIdx = text.indexOf('）', fullIdx);
    const jaName = text.slice(0, fullIdx).trim();
    const inside = endIdx > fullIdx ? text.slice(fullIdx + 1, endIdx).trim() : '';
    const sciAbbrev = inside.match(/^[A-Z]/) ? inside : '';
    return { jaName, sciAbbrev };
  }
  if (halfIdx >= 0) {
    const endIdx = text.indexOf(')', halfIdx);
    const jaName = text.slice(0, halfIdx).trim();
    const inside = endIdx > halfIdx ? text.slice(halfIdx + 1, endIdx).trim() : '';
    const sciAbbrev = inside.match(/^[A-Z]/) ? inside : '';
    return { jaName, sciAbbrev };
  }
  return { jaName: text.trim(), sciAbbrev: '' };
}

/** "フクロギツネ属 Trichosurus" → "Trichosurus" */
function extractLatinGenus(genusText: string): string {
  const m = genusText.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*$/);
  return m?.[1] ?? '';
}

/** "T. vulpecula" + genus "Trichosurus" → "Trichosurus vulpecula" */
function buildScientificName(sciAbbrev: string, latinGenus: string): string {
  if (!sciAbbrev) return latinGenus;
  // ドットがない場合はすでに完全な学名（例: "Aromia bungii"）なので属名を重複させない
  if (!sciAbbrev.includes('.')) {
    return sciAbbrev;
  }
  // "T. vulpecula" → take everything after ". "
  const parts = sciAbbrev.split(/\.\s+/);
  const epithet = parts.length > 1 ? parts.slice(1).join(' ') : sciAbbrev;
  return latinGenus ? `${latinGenus} ${epithet}`.trim() : epithet;
}

export async function scrapeList(): Promise<SpeciesBasic[]> {
  console.log('[scrape-list] フェッチ中:', LIST_URL);
  const res = await fetch(LIST_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (invasive-species-viewer/1.0; research)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const results: SpeciesBasic[] = [];
  let currentCategory: Category | null = null;

  // ページを上から順に走査してカテゴリとテーブルを対応付ける
  $('body')
    .find('*')
    .each((_, el) => {
      const tag = (el as Element).tagName?.toLowerCase();
      if (!tag) return;

      const text = $(el).clone().children().remove().end().text().trim();

      // カテゴリ見出し検出（●哺乳類 or 哺乳類（N種類）を含む p/h3/h4/b/td など）
      if (!['script', 'style'].includes(tag)) {
        for (const cat of CATEGORIES) {
          if (text.includes(cat) && text.length < 30) {
            currentCategory = cat as Category;
            break;
          }
        }
      }

      // 特定外来生物テーブル検出（"特定外来生物一覧"の表 = 目|科|属|種名|状況 の列を持つ）
      if (tag === 'table' && currentCategory) {
        const rows = parseTableRows($, el);

        // ヘッダ行をスキップして種行を特定する
        // 種行の判定: 最後から2列目に種名らしいテキスト、最後列に定着状況らしいテキストがある
        const STATUS_VALUES = new Set([
          '定着',
          '未定着',
          '根絶',
          '近年生息情報なし',
          '未入力',
          '国内未定着',
        ]);

        let currentOrder = '';
        let currentFamily = '';
        let currentGenus = '';
        let currentLatinGenus = '';

        for (const { cells, links } of rows) {
          // セル数が2未満はスキップ
          if (cells.length < 2) continue;

          const lastCell = cells[cells.length - 1];
          const secondLast = cells[cells.length - 2];

          // 定着状況かどうかのチェック（列が複数ある場合の安全策）
          // STATUS_VALUES に含まれるか「未」「定着」を含む
          const isStatusLike = (s: string) =>
            STATUS_VALUES.has(s) || s.includes('定着') || s === '根絶';

          if (!isStatusLike(lastCell)) continue;

          const status = lastCell.trim();
          const speciesText = secondLast.trim();

          // 目・科・属を更新（セル数が5以上のとき: 先頭3列が目・科・属）
          if (cells.length >= 5) {
            if (cells[0]) currentOrder = cells[0].trim();
            if (cells[1]) currentFamily = cells[1].trim();
            if (cells[2]) {
              currentGenus = cells[2].trim();
              currentLatinGenus = extractLatinGenus(currentGenus);
            }
          }

          if (!speciesText || speciesText === '目' || speciesText === '科' || speciesText === '属')
            continue;

          const { jaName, sciAbbrev } = parseSpeciesCell(speciesText);
          if (!jaName || jaName.length > 40) continue;

          // 学名略称が "(ただし、次のものを除く)" のような注記の場合はスキップ
          if (jaName.includes('ただし') || jaName.includes('のものを除く')) continue;
          // グループ名（"〇〇科の全種"など）はスキップ（次行で個別種が来る）
          // ただしそのままエントリにする場合もある
          const isGroupEntry = jaName.includes('の全種') || jaName.includes('属の全');

          const scientificName = buildScientificName(sciAbbrev, currentLatinGenus);
          const isConditional = speciesText.includes('条件付特定外来生物');

          // NIES URLはsecondLastのリンクから
          const speciesLinkIdx = cells.length - 2;
          const niesUrl = links[speciesLinkIdx] ?? '';

          results.push({
            jaName,
            scientificName,
            category: currentCategory!,
            order: currentOrder,
            family: currentFamily,
            genus: currentGenus,
            status,
            isConditional,
            niesUrl: niesUrl || undefined,
          });
        }
      }
    });

  console.log(`[scrape-list] 取得件数: ${results.length}`);
  return results;
}

// 単体実行
if (require.main === module) {
  scrapeList().then((data) => {
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
  });
}

/**
 * scrape-descriptions.ts
 * NIES 侵入生物データベースの各種詳細ページから
 * 基本情報・生態・侵入情報・影響・対策など詳細項目を取得して data/species.json に書き込む
 */
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fetchText, sleep } from './http';

const DATA_PATH = path.join(process.cwd(), 'data', 'species.json');
const DELAY_MS = 1200;

interface SpeciesDescription {
  englishName?: string;
  nativeRange?: string;
  morphology?: string;
  ecology?: string;
  breeding?: string;
  habitat?: string;
  sourceRegion?: string;
  pathway?: string;
  invasionEra?: string;
  overseasRange?: string;
  impact?: string;
  legalNote?: string;
  control?: string;
  issues?: string;
  remarks?: string;
}

interface Species {
  id: string;
  jaName: string;
  niesUrl?: string;
  description?: SpeciesDescription;
  [key: string]: unknown;
}

const TARGET_LABELS: Record<string, keyof SpeciesDescription> = {
  英名等: 'englishName',
  自然分布: 'nativeRange',
  形態: 'morphology',
  生態的特性: 'ecology',
  繁殖生態: 'breeding',
  生息環境: 'habitat',
  移入元: 'sourceRegion',
  侵入経路: 'pathway',
  侵入年代: 'invasionEra',
  海外移入分布: 'overseasRange',
  影響: 'impact',
  法的扱い: 'legalNote',
  防除方法: 'control',
  問題点等: 'issues',
  備考: 'remarks',
};

// NIES のページは学術論文調の全角句点（，．）を使っているため、
// 一般向け表示に合わせて日本語の句読点（、。）に正規化する。
function normalizePunctuation(text: string): string {
  let t = text.replace(/，/g, '、').replace(/．/g, '。');
  t = t.replace(/。{2,}/g, '。').replace(/、{2,}/g, '、');
  t = t.trim();
  if (t.endsWith('、')) t = `${t.slice(0, -1)}。`;
  return t;
}

async function fetchDescription(url: string): Promise<SpeciesDescription> {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const desc: SpeciesDescription = {};

  $('td').each((_, el) => {
    const $el = $(el);
    const label = $el.text().trim();
    const key = TARGET_LABELS[label];
    if (!key) return;
    const content = $el.next('td').text().replace(/\s+/g, ' ').trim();
    if (content) desc[key] = normalizePunctuation(content);
  });

  return desc;
}

async function main() {
  const species: Species[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const targets = species.filter((s) => s.niesUrl);

  console.log(`対象: ${targets.length} 件 / 全 ${species.length} 件`);

  let done = 0;
  let errors = 0;

  for (const s of targets) {
    if (!s.niesUrl) continue;
    try {
      await sleep(DELAY_MS);
      const desc = await fetchDescription(s.niesUrl);
      const hasContent = Object.values(desc).some(Boolean);
      if (hasContent) {
        s.description = desc;
        const keys = Object.keys(desc).join(', ');
        console.log(`[${++done}/${targets.length}] ${s.jaName} (${keys})`);
      } else {
        console.log(`[${++done}/${targets.length}] ${s.jaName} — 取得項目なし`);
      }
    } catch (e) {
      console.warn(`  ✗ ${s.jaName}: ${e}`);
      errors++;
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(species, null, 2));
  console.log(`\n完了: ${done} 件処理, ${errors} 件エラー`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

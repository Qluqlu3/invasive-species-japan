/**
 * scrape-descriptions.ts
 * NIES 侵入生物データベースの各種詳細ページから
 * 形態・生息環境・影響・防除方法 を取得して data/species.json に書き込む
 */
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'species.json');
const DELAY_MS = 1200;

interface SpeciesDescription {
  morphology?: string;
  habitat?: string;
  impact?: string;
  control?: string;
}

interface Species {
  id: string;
  jaName: string;
  niesUrl?: string;
  description?: SpeciesDescription;
  [key: string]: unknown;
}

const TARGET_LABELS: Record<string, keyof SpeciesDescription> = {
  形態: 'morphology',
  生息環境: 'habitat',
  影響: 'impact',
  防除方法: 'control',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchDescription(url: string): Promise<SpeciesDescription> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (invasive-species-viewer/1.0; research)',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const desc: SpeciesDescription = {};

  $('td').each((_, el) => {
    const $el = $(el);
    const label = $el.text().trim();
    const key = TARGET_LABELS[label];
    if (!key) return;
    const content = $el.next('td').text().replace(/\s+/g, ' ').trim();
    if (content) desc[key] = content;
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

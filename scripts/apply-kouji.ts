/**
 * apply-kouji.ts
 * 環境省「防除の公示一覧」を再取得し、既存の data/species.json に反映する。
 * build:data（全スクレイパーの再実行）を伴わずに、この情報だけを
 * 更新したい場合に使う。
 *
 * 使い方: npx ts-node --project tsconfig.scripts.json scripts/apply-kouji.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { matchKoujiEntries, scrapeKouji } from './scrape-kouji';
import type { Species } from './types';

const DATA_PATH = path.join(__dirname, '..', 'data', 'species.json');

async function main() {
  const species: Species[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  const entries = await scrapeKouji();
  const koujiMap = matchKoujiEntries(entries, species);

  let updated = 0;
  for (const s of species) {
    const authorizations = koujiMap.get(s.id);
    if (authorizations) {
      s.controlAuthorizations = authorizations;
      updated++;
    } else if (s.controlAuthorizations) {
      s.controlAuthorizations = undefined;
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(species, null, 2), 'utf-8');
  console.log(`✓ 防除情報を ${updated} 種に反映しました: ${DATA_PATH}`);
}

main().catch((err) => {
  console.error('エラー:', err);
  process.exit(1);
});

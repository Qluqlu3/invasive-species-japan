/**
 * apply-kouji.ts
 * 環境省「防除の公示一覧」を再取得し、既存の data/species.json に反映する。
 * build:data（全スクレイパーの再実行）を伴わずに、この情報だけを
 * 更新したい場合に使う。
 *
 * 使い方: npx ts-node --project tsconfig.scripts.json scripts/apply-kouji.ts
 */
import { matchKoujiEntries, scrapeKouji } from './scrape-kouji';
import {
  readSpeciesData,
  SPECIES_DATA_PATH,
  writeSpeciesData,
} from './species-store';

async function main() {
  const species = readSpeciesData();

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

  writeSpeciesData(species);
  console.log(`✓ 防除情報を ${updated} 種に反映しました: ${SPECIES_DATA_PATH}`);
}

main().catch((err) => {
  console.error('エラー:', err);
  process.exit(1);
});

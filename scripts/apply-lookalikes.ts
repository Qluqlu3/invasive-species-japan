/**
 * apply-lookalikes.ts
 * lookalikes-data.ts の内容を、既存の data/species.json に反映する。
 * build:data（外部サイトへの再スクレイピング）を伴わずに
 * lookalikes-data.ts の更新だけを反映したい場合に使う。
 *
 * 使い方: npx ts-node --project tsconfig.scripts.json scripts/apply-lookalikes.ts
 */
import { LOOKALIKES } from './lookalikes-data';
import {
  readSpeciesData,
  SPECIES_DATA_PATH,
  writeSpeciesData,
} from './species-store';

function main() {
  const species = readSpeciesData();

  let updated = 0;
  for (const s of species) {
    const lookalikes = LOOKALIKES[s.id];
    if (lookalikes) {
      s.lookalikes = lookalikes;
      updated++;
    } else if (s.lookalikes) {
      s.lookalikes = undefined;
    }
  }

  writeSpeciesData(species);
  console.log(
    `✓ lookalikes を ${updated} 種に反映しました: ${SPECIES_DATA_PATH}`,
  );
}

main();

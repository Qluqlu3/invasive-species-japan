/**
 * apply-lookalikes.ts
 * lookalikes-data.ts の内容を、既存の data/species.json に反映する。
 * build:data（外部サイトへの再スクレイピング）を伴わずに
 * lookalikes-data.ts の更新だけを反映したい場合に使う。
 *
 * 使い方: npx ts-node --project tsconfig.scripts.json scripts/apply-lookalikes.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import type { Species } from '../lib/types';
import { LOOKALIKES } from './lookalikes-data';

const DATA_PATH = path.join(__dirname, '..', 'data', 'species.json');

function main() {
  const species: Species[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

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

  fs.writeFileSync(DATA_PATH, JSON.stringify(species, null, 2), 'utf-8');
  console.log(`✓ lookalikes を ${updated} 種に反映しました: ${DATA_PATH}`);
}

main();

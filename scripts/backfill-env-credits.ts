/**
 * data/species.json の写真のうち、まだ photoCredits が付いていないものに
 * 環境省提供のクレジットを補完する一回限りの整備スクリプト。
 * （Wikimedia由来の写真は scrape-wikimedia.ts が既にクレジットを設定済み）
 */
import fs from 'fs';
import path from 'path';
import type { PhotoCredit, Species } from '../lib/types';

const DATA_PATH = path.join(process.cwd(), 'data', 'species.json');

const ENV_CREDIT: PhotoCredit = {
  source: 'env',
  credit: '環境省提供',
  sourceUrl: 'https://www.env.go.jp/nature/intro/4document/asimg.html',
};

function main() {
  const species: Species[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  let count = 0;
  for (const s of species) {
    if (!s.photoCredits) s.photoCredits = {};
    for (const p of s.photos) {
      if (s.photoCredits[p] === undefined) {
        s.photoCredits[p] = { ...ENV_CREDIT };
        count++;
      }
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(species, null, 2));
  console.log(`完了: ${count} 件の写真に環境省提供クレジットを補完`);
}

main();

import fs from 'fs';
import path from 'path';
import { fetchBuffer, sleep } from './http';
import { processImage } from './image-processing';
import {
  readSpeciesData,
  SPECIES_IMAGES_DIR,
  writeSpeciesData,
} from './species-store';

// env.go.jp へのレート制限対策
const DELAY_MS = 300;

async function main() {
  const species = readSpeciesData();

  let total = 0;
  let skipped = 0;
  let errors = 0;

  for (const s of species) {
    if (s.photos.length === 0) continue;

    const dir = path.join(SPECIES_IMAGES_DIR, s.id);
    fs.mkdirSync(dir, { recursive: true });

    const newPhotos: string[] = [];

    for (let i = 0; i < s.photos.length; i++) {
      const url = s.photos[i];
      const localPath = `/images/species/${s.id}/${i}.webp`;
      const localFsPath = path.join(SPECIES_IMAGES_DIR, s.id, `${i}.webp`);

      // すでにローカルパスなら変換不要
      if (url.startsWith('/')) {
        newPhotos.push(url);
        skipped++;
        continue;
      }

      // ダウンロード済みならスキップ
      if (fs.existsSync(localFsPath)) {
        newPhotos.push(localPath);
        skipped++;
        continue;
      }

      try {
        await sleep(DELAY_MS);
        const raw = await fetchBuffer(url);
        const { buffer, label } = await processImage(raw);
        fs.writeFileSync(localFsPath, buffer);
        newPhotos.push(localPath);
        total++;
        console.log(`[${total}] ${s.jaName} [${i}] ${label}`);
      } catch (e) {
        console.warn(`  ✗ ${s.jaName} [${i}]: ${e}`);
        newPhotos.push(url);
        errors++;
      }
    }

    s.photos = newPhotos;
  }

  writeSpeciesData(species);

  console.log(
    `\n完了: ${total} 件処理, ${skipped} 件スキップ, ${errors} 件エラー`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

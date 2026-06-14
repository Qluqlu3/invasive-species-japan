import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const DATA_PATH = path.join(process.cwd(), 'data', 'species.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images', 'species');

// この幅未満の画像は 2x アップスケール
const UPSCALE_THRESHOLD = 400;
const WEBP_QUALITY = 85;
// env.go.jp へのレート制限対策
const DELAY_MS = 300;

interface Species {
  id: string;
  jaName: string;
  photos: string[];
  [key: string]: unknown;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; invasive-species-viewer)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function processImage(buf: Buffer): Promise<Buffer> {
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  let pipeline = sharp(buf);

  // 幅が閾値未満なら Lanczos で 2x アップスケール
  if (w > 0 && w < UPSCALE_THRESHOLD) {
    pipeline = pipeline.resize(w * 2, h > 0 ? h * 2 : undefined, {
      kernel: sharp.kernel.lanczos3,
    });
  }

  // アンシャープマスク（輪郭強調）
  pipeline = pipeline.sharpen({ sigma: 1.2, m1: 0.5, m2: 2.5 });

  return pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
}

async function main() {
  const species: Species[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  let total = 0;
  let skipped = 0;
  let errors = 0;

  for (const s of species) {
    if (s.photos.length === 0) continue;

    const dir = path.join(PUBLIC_DIR, s.id);
    fs.mkdirSync(dir, { recursive: true });

    const newPhotos: string[] = [];

    for (let i = 0; i < s.photos.length; i++) {
      const url = s.photos[i];
      const localPath = `/images/species/${s.id}/${i}.webp`;
      const localFsPath = path.join(PUBLIC_DIR, s.id, `${i}.webp`);

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
        const raw = await fetchImage(url);
        const processed = await processImage(raw);
        fs.writeFileSync(localFsPath, processed);
        newPhotos.push(localPath);
        total++;

        const meta = await sharp(raw).metadata();
        const label =
          (meta.width ?? 0) < UPSCALE_THRESHOLD ? '↑2x+sharpen' : 'sharpen';
        console.log(`[${total}] ${s.jaName} [${i}] ${label}`);
      } catch (e) {
        console.warn(`  ✗ ${s.jaName} [${i}]: ${e}`);
        newPhotos.push(url);
        errors++;
      }
    }

    s.photos = newPhotos;
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(species, null, 2));

  console.log(`\n完了: ${total} 件処理, ${skipped} 件スキップ, ${errors} 件エラー`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

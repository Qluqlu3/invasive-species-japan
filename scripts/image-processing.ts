/**
 * image-processing.ts
 * 種の写真を public/images/species 配下に保存する前の共通画像処理（リサイズ・輪郭強調・WebP変換）
 */
import sharp from 'sharp';

// この幅未満の画像は 2x アップスケール（フルサイズ原本を使うようになった後は
// ほぼ発生しないはずだが、稀に小さい原本しかない種のための保険）
export const UPSCALE_THRESHOLD = 400;
// この幅を超える画像は縮小してリポジトリ容量を抑える（表示に必要な解像度は十分ある）
export const MAX_WIDTH = 1200;
export const WEBP_QUALITY = 85;

export interface ProcessedImage {
  buffer: Buffer;
  /** 適用した処理の説明（ログ表示用） */
  label: string;
}

export async function processImage(buf: Buffer): Promise<ProcessedImage> {
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  let pipeline = sharp(buf);
  let label = 'sharpen';

  // 幅が閾値未満なら Lanczos で 2x アップスケール
  if (w > 0 && w < UPSCALE_THRESHOLD) {
    pipeline = pipeline.resize(w * 2, h > 0 ? h * 2 : undefined, {
      kernel: sharp.kernel.lanczos3,
    });
    label = '↑2x+sharpen';
  } else if (w > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, undefined, {
      kernel: sharp.kernel.lanczos3,
    });
    label = `縮小${w}→${MAX_WIDTH}+sharpen`;
  }

  // アンシャープマスク（輪郭強調）
  pipeline = pipeline.sharpen({ sigma: 1.2, m1: 0.5, m2: 2.5 });

  const buffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
  return { buffer, label };
}

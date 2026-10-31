// @vitest-environment node
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { MAX_WIDTH, processImage } from './image-processing';

function makeImage(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: '#16a34a' },
  })
    .png()
    .toBuffer();
}

describe('processImage', () => {
  it('閾値未満の幅の画像は2倍にアップスケールする', async () => {
    const { buffer, label } = await processImage(await makeImage(200, 100));
    const meta = await sharp(buffer).metadata();
    expect([meta.width, meta.height]).toEqual([400, 200]);
    expect(label).toBe('↑2x+sharpen');
  });

  it('上限を超える幅の画像は縮小する（縦横比は維持）', async () => {
    const { buffer, label } = await processImage(await makeImage(2400, 1200));
    const meta = await sharp(buffer).metadata();
    expect([meta.width, meta.height]).toEqual([MAX_WIDTH, 600]);
    expect(label).toBe(`縮小2400→${MAX_WIDTH}+sharpen`);
  });

  it('範囲内の幅の画像はサイズを変えない', async () => {
    const { buffer, label } = await processImage(await makeImage(800, 600));
    const meta = await sharp(buffer).metadata();
    expect([meta.width, meta.height]).toEqual([800, 600]);
    expect(label).toBe('sharpen');
  });

  it('WebP形式で出力する', async () => {
    const { buffer } = await processImage(await makeImage(800, 600));
    expect((await sharp(buffer).metadata()).format).toBe('webp');
  });
});

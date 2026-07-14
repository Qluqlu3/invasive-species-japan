/**
 * species-matching.ts
 * 複数のスクレイパー結果を和名で突き合わせるための純粋関数群。
 * build-data.ts の統合ロジックから切り出し、ユニットテスト可能にしている。
 */
import type { NiesEntry } from './scrape-nies';

/** 和名を正規化してマッチング精度を上げる（括弧・スペース除去） */
export function normalize(name: string): string {
  return name
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, '')
    .replace(/　/g, '')
    .trim();
}

/** 学名からURL-safe なスラッグを生成する（重複時は連番を付与） */
export function makeId(
  scientificName: string,
  index: number,
  usedIds: Set<string>,
): string {
  const base = scientificName
    ? scientificName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    : `species-${index}`;

  if (!usedIds.has(base)) {
    usedIds.add(base);
    return base;
  }

  let n = 2;
  let candidate = `${base}-${n}`;
  while (usedIds.has(candidate)) {
    candidate = `${base}-${++n}`;
  }
  usedIds.add(candidate);
  return candidate;
}

/**
 * 和名で写真URLを突き合わせる。
 * 完全一致 → 正規化一致 → 部分一致（キョン、アライグマ等の短い名前用）の順に試す。
 */
export function matchPhotos(
  jaName: string,
  photoMap: Map<string, string[]>,
): string[] {
  let photos = photoMap.get(jaName) ?? photoMap.get(normalize(jaName)) ?? [];
  if (photos.length === 0) {
    for (const [key, urls] of photoMap) {
      if (key.includes(jaName) || jaName.includes(key)) {
        photos = urls;
        break;
      }
    }
  }
  return photos;
}

/** 和名でNIESエントリを突き合わせる（完全一致 → 正規化一致）。 */
export function matchNiesEntry(
  jaName: string,
  niesMap: Map<string, NiesEntry>,
): NiesEntry | null {
  return niesMap.get(jaName) ?? niesMap.get(normalize(jaName)) ?? null;
}

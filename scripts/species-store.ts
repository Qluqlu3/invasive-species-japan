/**
 * species-store.ts
 * データ収集スクリプト共通の data/species.json・data/meta.json 読み書きユーティリティ。
 * 実行時のカレントディレクトリに依存しないよう、パスはこのファイルの位置から解決する。
 */
import * as fs from 'fs';
import * as path from 'path';
import type { DataMeta, Species } from '../lib/types';

export const DATA_DIR = path.join(__dirname, '..', 'data');
export const SPECIES_DATA_PATH = path.join(DATA_DIR, 'species.json');
export const META_DATA_PATH = path.join(DATA_DIR, 'meta.json');
/** 種ごとの写真（public/images/species/{id}/{n}.webp）の保存先 */
export const SPECIES_IMAGES_DIR = path.join(
  __dirname,
  '..',
  'public',
  'images',
  'species',
);

/** data/species.json を読み込む */
export function readSpeciesData(filePath = SPECIES_DATA_PATH): Species[] {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/** data/species.json を書き出す（ディレクトリが無ければ作成する） */
export function writeSpeciesData(
  species: Species[],
  filePath = SPECIES_DATA_PATH,
): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(species, null, 2), 'utf-8');
}

/** data/meta.json を書き出す */
export function writeDataMeta(meta: DataMeta, filePath = META_DATA_PATH): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(meta, null, 2)}\n`, 'utf-8');
}

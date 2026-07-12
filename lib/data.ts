import fs from 'fs';
import path from 'path';
import type { DataMeta, Species } from './types';

let _cache: Species[] | null = null;
let _metaCache: DataMeta | null | undefined;

const REQUIRED_STRING_FIELDS = [
  'id',
  'jaName',
  'scientificName',
  'category',
  'order',
  'family',
  'genus',
  'status',
] as const;

function assertIsSpeciesArray(
  value: unknown,
  filePath: string,
): asserts value is Species[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `種データの形式が不正です（配列ではありません）: ${filePath}`,
    );
  }

  value.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(
        `種データの形式が不正です（${index}番目が object ではありません）: ${filePath}`,
      );
    }

    const record = item as Record<string, unknown>;
    for (const field of REQUIRED_STRING_FIELDS) {
      if (typeof record[field] !== 'string') {
        throw new Error(
          `種データの形式が不正です（${index}番目の "${field}" が文字列ではありません）: ${filePath}`,
        );
      }
    }
    if (typeof record.isConditional !== 'boolean') {
      throw new Error(
        `種データの形式が不正です（${index}番目の "isConditional" が真偽値ではありません）: ${filePath}`,
      );
    }
    if (!Array.isArray(record.photos) || !Array.isArray(record.prefectures)) {
      throw new Error(
        `種データの形式が不正です（${index}番目の "photos"/"prefectures" が配列ではありません）: ${filePath}`,
      );
    }
  });
}

export function getAllSpecies(): Species[] {
  if (_cache) return _cache;
  const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'species.json');

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    throw new Error(`種データファイルを読み込めません: ${filePath}`, {
      cause: err,
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`種データファイルのJSONが不正です: ${filePath}`, {
      cause: err,
    });
  }

  assertIsSpeciesArray(parsed, filePath);
  _cache = parsed;
  return _cache;
}

/** データ収集パイプラインの最終実行日を返す。meta.json が無い場合は null */
export function getDataMeta(): DataMeta | null {
  if (_metaCache !== undefined) return _metaCache;

  const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'meta.json');

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lastUpdated === 'string') {
      _metaCache = parsed as DataMeta;
      return _metaCache;
    }
  } catch {
    // meta.json が無い/壊れていてもアプリ本体は動かせるようにする
  }

  _metaCache = null;
  return null;
}

export function getSpeciesById(id: string): Species | undefined {
  return getAllSpecies().find((s) => s.id === id);
}

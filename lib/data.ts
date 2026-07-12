import fs from 'fs';
import path from 'path';
import type { Species } from './types';

let _cache: Species[] | null = null;

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

export function getSpeciesById(id: string): Species | undefined {
  return getAllSpecies().find((s) => s.id === id);
}

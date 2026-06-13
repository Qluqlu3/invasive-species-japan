import fs from 'fs';
import path from 'path';
import type { Species } from './types';

let _cache: Species[] | null = null;

export function getAllSpecies(): Species[] {
  if (_cache) return _cache;
  const dataDir =
    process.env.DATA_DIR ?? path.join(process.cwd(), '..', 'data');
  const filePath = path.join(dataDir, 'species.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  _cache = JSON.parse(raw) as Species[];
  return _cache;
}

export function getSpeciesById(id: string): Species | undefined {
  return getAllSpecies().find((s) => s.id === id);
}

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Species } from '../lib/types';
import {
  readSpeciesData,
  writeDataMeta,
  writeSpeciesData,
} from './species-store';

const SPECIES: Species[] = [
  {
    id: 'procyon-lotor',
    jaName: 'アライグマ',
    scientificName: 'Procyon lotor',
    category: '哺乳類',
    order: '食肉目',
    family: 'アライグマ科',
    genus: 'Procyon',
    status: '定着',
    isConditional: false,
    photos: [],
    prefectures: ['東京'],
  },
];

describe('species-store', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'species-store-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('書き出した種データを読み戻せる（ディレクトリが無ければ作成する）', () => {
    const filePath = path.join(tmpDir, 'nested', 'species.json');
    writeSpeciesData(SPECIES, filePath);
    expect(readSpeciesData(filePath)).toEqual(SPECIES);
  });

  it('種データは2スペースインデント・末尾改行なしで書き出す', () => {
    const filePath = path.join(tmpDir, 'species.json');
    writeSpeciesData(SPECIES, filePath);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe(
      JSON.stringify(SPECIES, null, 2),
    );
  });

  it('メタデータは末尾改行付きで書き出す', () => {
    const filePath = path.join(tmpDir, 'meta.json');
    writeDataMeta({ lastUpdated: '2026-10-18' }, filePath);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe(
      '{\n  "lastUpdated": "2026-10-18"\n}\n',
    );
  });
});

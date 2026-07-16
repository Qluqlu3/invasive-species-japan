import { describe, expect, it } from 'vitest';
import type { KoujiEntry } from './scrape-kouji';
import { matchKoujiEntries } from './scrape-kouji';

function makeEntry(overrides: Partial<KoujiEntry>): KoujiEntry {
  return {
    speciesText: '',
    type: '公示',
    organization: 'テスト自治体',
    region: 'テスト地方',
    area: 'テスト市内全域',
    period: 'R6.4.1～R16.3.31',
    objective: '生態系への影響軽減',
    method: '捕獲・防除',
    ministry: '環境',
    sourceUrl: 'https://example.com/kouji.html#test',
    ...overrides,
  };
}

const RACCOON = { id: 'procyon-lotor', jaName: 'アライグマ' };
const BASS = { id: 'micropterus-salmoides', jaName: 'オオクチバス' };
const SMALLMOUTH_BASS = { id: 'micropterus-dolomieu', jaName: 'コクチバス' };
const SPECIES = [RACCOON, BASS, SMALLMOUTH_BASS];

describe('matchKoujiEntries', () => {
  it('完全一致する種にひもづける', () => {
    const entries = [makeEntry({ speciesText: 'アライグマ' })];
    const result = matchKoujiEntries(entries, SPECIES);
    expect(result.get('procyon-lotor')).toHaveLength(1);
    expect(result.get('procyon-lotor')?.[0]).toMatchObject({
      organization: 'テスト自治体',
      area: 'テスト市内全域',
    });
  });

  it('「、」区切りで複数種がまとめられている行を、それぞれの種にひもづける', () => {
    const entries = [makeEntry({ speciesText: 'コクチバス、オオクチバス' })];
    const result = matchKoujiEntries(entries, SPECIES);
    expect(result.get('micropterus-dolomieu')).toHaveLength(1);
    expect(result.get('micropterus-salmoides')).toHaveLength(1);
    expect(result.has('procyon-lotor')).toBe(false);
  });

  it('一致する種がなければ何も登録しない', () => {
    const entries = [makeEntry({ speciesText: 'ヌートリア' })];
    const result = matchKoujiEntries(entries, SPECIES);
    expect(result.size).toBe(0);
  });

  it('同じ種が複数行にまたがる場合はすべて配列に積み上げる', () => {
    const entries = [
      makeEntry({ speciesText: 'アライグマ', organization: 'A市' }),
      makeEntry({ speciesText: 'アライグマ', organization: 'B町' }),
    ];
    const result = matchKoujiEntries(entries, SPECIES);
    const authorizations = result.get('procyon-lotor');
    expect(authorizations).toHaveLength(2);
    expect(authorizations?.map((a) => a.organization)).toEqual(['A市', 'B町']);
  });

  it('括弧違いなど表記ゆれは正規化して一致させる', () => {
    const entries = [makeEntry({ speciesText: 'アライグマ（外来種）' })];
    const result = matchKoujiEntries(entries, SPECIES);
    expect(result.get('procyon-lotor')).toHaveLength(1);
  });

  it('kouji.html特有の言い回しゆれはエイリアスで一致させる', () => {
    const entries = [
      makeEntry({
        speciesText:
          'オオサンショウウオ属に属する種とオオサンショウウオ属に属する他の種の交雑により生じた生物',
      }),
    ];
    const result = matchKoujiEntries(entries, [
      {
        id: 'andrias',
        jaName: 'オオサンショウウオ属に属する種間の交雑により生じた生物',
      },
    ]);
    expect(result.get('andrias')).toHaveLength(1);
  });

  it('部分一致で短い正式名を長い記載にひもづける', () => {
    const entries = [
      makeEntry({ speciesText: 'その他のソレノプスィス・ゲミナタ種群' }),
    ];
    const result = matchKoujiEntries(entries, [
      { id: 'solenopsis', jaName: 'その他のソレノプスィス・ゲミナタ種群' },
    ]);
    expect(result.get('solenopsis')).toHaveLength(1);
  });

  it('出典URLをそのまま引き継ぐ', () => {
    const entries = [
      makeEntry({
        speciesText: 'アライグマ',
        sourceUrl: 'https://example.com/kouji.html#kantou',
      }),
    ];
    const result = matchKoujiEntries(entries, SPECIES);
    expect(result.get('procyon-lotor')?.[0].sourceUrl).toBe(
      'https://example.com/kouji.html#kantou',
    );
  });
});

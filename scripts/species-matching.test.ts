import { describe, expect, it } from 'vitest';
import type { NiesEntry } from './scrape-nies';
import {
  makeId,
  matchNiesEntry,
  matchPhotos,
  normalize,
} from './species-matching';

describe('normalize', () => {
  it('全角括弧とその中身を除去する', () => {
    expect(normalize('アライグマ（外来種）')).toBe('アライグマ');
  });

  it('半角括弧とその中身を除去する', () => {
    expect(normalize('Raccoon (Procyon lotor)')).toBe('Raccoon');
  });

  it('半角スペースを除去する', () => {
    expect(normalize('タイワン ザル')).toBe('タイワンザル');
  });

  it('全角スペースを除去する', () => {
    expect(normalize('タイワン　ザル')).toBe('タイワンザル');
  });

  it('前後の空白をトリムする', () => {
    expect(normalize('  アライグマ  ')).toBe('アライグマ');
  });

  it('何も変換不要な文字列はそのまま返す', () => {
    expect(normalize('アライグマ')).toBe('アライグマ');
  });
});

describe('makeId', () => {
  it('学名からURL-safeなスラッグを生成する', () => {
    const usedIds = new Set<string>();
    expect(makeId('Procyon lotor', 0, usedIds)).toBe('procyon-lotor');
  });

  it('学名が空の場合はインデックスからIDを生成する', () => {
    const usedIds = new Set<string>();
    expect(makeId('', 5, usedIds)).toBe('species-5');
  });

  it('重複する場合は連番を付与する', () => {
    const usedIds = new Set<string>();
    expect(makeId('Solenopsis sp.', 0, usedIds)).toBe('solenopsis-sp');
    expect(makeId('Solenopsis sp.', 1, usedIds)).toBe('solenopsis-sp-2');
    expect(makeId('Solenopsis sp.', 2, usedIds)).toBe('solenopsis-sp-3');
  });

  it('生成したIDをusedIdsに登録する', () => {
    const usedIds = new Set<string>();
    makeId('Procyon lotor', 0, usedIds);
    expect(usedIds.has('procyon-lotor')).toBe(true);
  });
});

describe('matchPhotos', () => {
  it('完全一致を優先する', () => {
    const photoMap = new Map([
      ['アライグマ', ['a.jpg']],
      ['アライグマ（外来種）', ['b.jpg']],
    ]);
    expect(matchPhotos('アライグマ', photoMap)).toEqual(['a.jpg']);
  });

  it('完全一致がなければ正規化した名前で一致させる', () => {
    const photoMap = new Map([['アライグマ', ['a.jpg']]]);
    expect(matchPhotos('アライグマ（外来種）', photoMap)).toEqual(['a.jpg']);
  });

  it('完全一致・正規化一致がなければ部分一致にフォールバックする', () => {
    const photoMap = new Map([['キョン属', ['c.jpg']]]);
    expect(matchPhotos('キョン', photoMap)).toEqual(['c.jpg']);
  });

  it('部分一致も含めて何も一致しなければ空配列を返す', () => {
    const photoMap = new Map([['オオクチバス', ['d.jpg']]]);
    expect(matchPhotos('アライグマ', photoMap)).toEqual([]);
  });

  it('完全一致キー自体が空配列の場合、部分一致ループでも自分自身に一致してそのまま空配列になる', () => {
    // jaNameと同名のキーが空配列で存在すると、部分一致ループが
    // 最初にそのキー自身に一致してしまい、後続のより良い候補（アライグマ属）までは辿り着かない。
    const photoMap = new Map<string, string[]>([
      ['アライグマ', []],
      ['アライグマ属', ['e.jpg']],
    ]);
    expect(matchPhotos('アライグマ', photoMap)).toEqual([]);
  });
});

describe('matchNiesEntry', () => {
  const makeEntry = (prefectures: string[]): NiesEntry => ({
    jaName: 'テスト種',
    scientificName: 'Testus exampleus',
    isInvasive: true,
    distribution: '',
    prefectures,
    niesDetailUrl: 'https://example.com',
  });

  it('完全一致を優先する', () => {
    const entry = makeEntry(['東京']);
    const niesMap = new Map([['アライグマ', entry]]);
    expect(matchNiesEntry('アライグマ', niesMap)).toBe(entry);
  });

  it('完全一致がなければ正規化した名前で一致させる', () => {
    const entry = makeEntry(['東京']);
    const niesMap = new Map([['アライグマ', entry]]);
    expect(matchNiesEntry('アライグマ（外来種）', niesMap)).toBe(entry);
  });

  it('一致しなければnullを返す', () => {
    const niesMap = new Map([['アライグマ', makeEntry(['東京'])]]);
    expect(matchNiesEntry('オオクチバス', niesMap)).toBeNull();
  });
});

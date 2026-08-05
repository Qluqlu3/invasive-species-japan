import { describe, expect, it } from 'vitest';
import {
  aggregatePrefectureStatus,
  filterAndSortSpecies,
  filterSpecies,
  paginate,
  sortSpecies,
} from './species-filter';
import type { Species } from './types';

function makeSpecies(overrides: Partial<Species>): Species {
  return {
    id: 'test-id',
    jaName: '',
    scientificName: '',
    category: '哺乳類',
    order: '',
    family: '',
    genus: '',
    status: '定着',
    isConditional: false,
    photos: [],
    prefectures: [],
    ...overrides,
  };
}

const RACCOON = makeSpecies({
  id: 'procyon-lotor',
  jaName: 'アライグマ',
  scientificName: 'Procyon lotor',
  category: '哺乳類',
  order: 'ネコ目',
  family: 'アライグマ科',
  genus: 'アライグマ属',
  status: '定着',
  prefectures: ['東京', '大阪'],
});

const BULLFROG = makeSpecies({
  id: 'bufo-marinus',
  jaName: 'オオヒキガエル',
  scientificName: 'Bufo marinus',
  category: '両生類',
  order: 'カエル目',
  family: 'ヒキガエル科',
  genus: 'ヒキガエル属',
  status: '未定着',
  isConditional: true,
  prefectures: ['沖縄'],
});

const BASS = makeSpecies({
  id: 'micropterus-salmoides',
  jaName: 'オオクチバス',
  scientificName: 'Micropterus salmoides',
  category: '魚類',
  order: 'スズキ目',
  family: 'サンフィッシュ科',
  genus: 'オオクチバス属',
  status: '定着',
  prefectures: ['東京'],
});

const ALL = [RACCOON, BULLFROG, BASS];

describe('filterSpecies', () => {
  it('絞り込み条件がなければ全件を返す', () => {
    expect(filterSpecies(ALL, {})).toEqual(ALL);
  });

  it('categoryで絞り込める', () => {
    expect(filterSpecies(ALL, { category: '魚類' })).toEqual([BASS]);
  });

  it('conditional=yesで条件付特定外来生物のみに絞り込める', () => {
    expect(filterSpecies(ALL, { conditional: 'yes' })).toEqual([BULLFROG]);
  });

  it('conditional=noで条件付以外のみに絞り込める', () => {
    expect(filterSpecies(ALL, { conditional: 'no' })).toEqual([RACCOON, BASS]);
  });

  it('statusで絞り込める', () => {
    expect(filterSpecies(ALL, { status: '未定着' })).toEqual([BULLFROG]);
  });

  it('prefectureで絞り込める', () => {
    expect(filterSpecies(ALL, { prefecture: '大阪' })).toEqual([RACCOON]);
  });

  it('queryは和名・学名・科・目・属を横断して大小文字を区別せず検索する', () => {
    expect(filterSpecies(ALL, { query: 'procyon' })).toEqual([RACCOON]);
    expect(filterSpecies(ALL, { query: 'PROCYON' })).toEqual([RACCOON]);
    expect(filterSpecies(ALL, { query: 'ヒキガエル科' })).toEqual([BULLFROG]);
  });

  it('複数条件はAND条件で組み合わさる', () => {
    expect(
      filterSpecies(ALL, { category: '哺乳類', prefecture: '大阪' }),
    ).toEqual([RACCOON]);
    expect(
      filterSpecies(ALL, { category: '哺乳類', prefecture: '沖縄' }),
    ).toEqual([]);
  });

  it('該当なしの場合は空配列を返す', () => {
    expect(filterSpecies(ALL, { query: '存在しない種名' })).toEqual([]);
  });

  it('hazardousOnly=trueで毒性ありの種だけに絞り込める', () => {
    const hazardousRaccoon = { ...RACCOON, hazardous: true };
    const list = [hazardousRaccoon, BULLFROG, BASS];
    expect(filterSpecies(list, { hazardousOnly: true })).toEqual([
      hazardousRaccoon,
    ]);
  });

  it('photoOnly=trueで写真ありの種だけに絞り込める', () => {
    const raccoonWithPhoto = { ...RACCOON, photos: ['/photo.jpg'] };
    const list = [raccoonWithPhoto, BULLFROG, BASS];
    expect(filterSpecies(list, { photoOnly: true })).toEqual([
      raccoonWithPhoto,
    ]);
  });
});

describe('sortSpecies', () => {
  it('sort未指定時は元の順序を保つ', () => {
    expect(sortSpecies(ALL, '')).toEqual(ALL);
  });

  it('name指定で和名の五十音順にソートする', () => {
    const result = sortSpecies(ALL, 'name').map((s) => s.jaName);
    expect(result).toEqual(['アライグマ', 'オオクチバス', 'オオヒキガエル']);
  });

  it('category指定でCATEGORIESの並び順にソートする', () => {
    const result = sortSpecies(ALL, 'category').map((s) => s.category);
    expect(result).toEqual(['哺乳類', '両生類', '魚類']);
  });

  it('status指定でSTATUSESの並び順にソートする', () => {
    const result = sortSpecies(ALL, 'status').map((s) => s.status);
    expect(result).toEqual(['定着', '定着', '未定着']);
  });

  it('元の配列を変更しない', () => {
    const original = [...ALL];
    sortSpecies(ALL, 'name');
    expect(ALL).toEqual(original);
  });

  it('hazardous指定で毒性ありの種を先頭にソートする', () => {
    const hazardousBullfrog = { ...BULLFROG, hazardous: true };
    const result = sortSpecies(
      [RACCOON, hazardousBullfrog, BASS],
      'hazardous',
    ).map((s) => s.id);
    expect(result).toEqual([hazardousBullfrog.id, RACCOON.id, BASS.id]);
  });

  it('photos指定で写真ありの種を先頭にソートする', () => {
    const raccoonWithPhoto = { ...RACCOON, photos: ['/photo.jpg'] };
    const result = sortSpecies(
      [BULLFROG, raccoonWithPhoto, BASS],
      'photos',
    ).map((s) => s.id);
    expect(result).toEqual([raccoonWithPhoto.id, BULLFROG.id, BASS.id]);
  });
});

describe('filterAndSortSpecies', () => {
  it('フィルタとソートを両方適用する', () => {
    const result = filterAndSortSpecies(ALL, {
      conditional: 'no',
      sort: 'name',
    }).map((s) => s.jaName);
    expect(result).toEqual(['アライグマ', 'オオクチバス']);
  });
});

describe('aggregatePrefectureStatus', () => {
  const PREFECTURES = ['東京', '大阪', '沖縄', '北海道'];

  it('都道府県ごとに該当種数を集計する', () => {
    const result = aggregatePrefectureStatus(ALL, PREFECTURES);
    expect(result['東京'].count).toBe(2); // RACCOON, BASS
    expect(result['大阪'].count).toBe(1); // RACCOON
    expect(result['沖縄'].count).toBe(1); // BULLFROG
    expect(result['北海道'].count).toBe(0);
  });

  it('該当種が無い都道府県はdominantStatusがundefinedになる', () => {
    const result = aggregatePrefectureStatus(ALL, PREFECTURES);
    expect(result['北海道'].dominantStatus).toBeUndefined();
  });

  it('該当種が1種のみならその種のstatusがdominantStatusになる', () => {
    const result = aggregatePrefectureStatus(ALL, PREFECTURES);
    expect(result['大阪'].dominantStatus).toBe('定着');
    expect(result['沖縄'].dominantStatus).toBe('未定着');
  });

  it('複数statusが混在する場合はSTATUS_PRIORITY順で最も懸念度が高いものを選ぶ', () => {
    // 東京には定着(RACCOON, BASS)のみだが、未定着種も追加すると定着が優先される
    const tokyoBullfrog = makeSpecies({
      status: '未定着',
      prefectures: ['東京'],
    });
    const result = aggregatePrefectureStatus(
      [...ALL, tokyoBullfrog],
      PREFECTURES,
    );
    expect(result['東京'].dominantStatus).toBe('定着');
  });

  it('未知のstatus値は集計対象から除外される（countには含まれる）', () => {
    const unknown = makeSpecies({ status: '謎', prefectures: ['北海道'] });
    const result = aggregatePrefectureStatus([unknown], PREFECTURES);
    expect(result['北海道'].count).toBe(1);
    expect(result['北海道'].dominantStatus).toBeUndefined();
  });

  it('speciesが空でも全都道府県のエントリを返す', () => {
    const result = aggregatePrefectureStatus([], PREFECTURES);
    for (const p of PREFECTURES) {
      expect(result[p]).toEqual({ count: 0 });
    }
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 100 }, (_, i) => i);

  it('visibleCount件だけ切り出す', () => {
    const { visible, hasMore } = paginate(items, 48);
    expect(visible).toHaveLength(48);
    expect(hasMore).toBe(true);
  });

  it('全件を下回らない場合はhasMoreがfalseになる', () => {
    const { visible, hasMore } = paginate(items, 100);
    expect(visible).toHaveLength(100);
    expect(hasMore).toBe(false);
  });

  it('visibleCountが総数を超えてもエラーにならない', () => {
    const { visible, hasMore } = paginate(items, 1000);
    expect(visible).toHaveLength(100);
    expect(hasMore).toBe(false);
  });

  it('空配列を渡してもエラーにならない', () => {
    expect(paginate([], 48)).toEqual({ visible: [], hasMore: false });
  });
});

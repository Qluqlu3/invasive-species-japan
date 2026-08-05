import {
  CATEGORIES,
  type Category,
  STATUS_PRIORITY,
  STATUSES,
  type Status,
} from './types';

export interface SpeciesFilters {
  query?: string;
  category?: string;
  conditional?: 'all' | 'yes' | 'no';
  status?: string;
  prefecture?: string;
  hazardousOnly?: boolean;
  photoOnly?: boolean;
}

/** フィルタ・ソートに必要な最小限のフィールド（一覧画面のフルデータ/軽量DTOのどちらでも使える） */
export interface FilterableSpecies {
  jaName: string;
  scientificName: string;
  category: string;
  order: string;
  family: string;
  genus: string;
  status: string;
  isConditional: boolean;
  prefectures: string[];
  photos: string[];
  /** 一覧の軽量DTOにのみ存在するため、フルデータ（Species型）では常にundefined扱い */
  hazardous?: boolean;
}

/** 一覧画面のフィルタ条件（カテゴリ・条件付き・定着状況・都道府県・検索語）を適用する */
export function filterSpecies<T extends FilterableSpecies>(
  species: T[],
  filters: SpeciesFilters,
): T[] {
  const {
    query,
    category,
    conditional,
    status,
    prefecture,
    hazardousOnly,
    photoOnly,
  } = filters;

  return species.filter((s) => {
    if (category && s.category !== category) return false;
    if (conditional === 'yes' && !s.isConditional) return false;
    if (conditional === 'no' && s.isConditional) return false;
    if (status && s.status !== status) return false;
    if (prefecture && !s.prefectures.includes(prefecture)) return false;
    if (hazardousOnly && !s.hazardous) return false;
    if (photoOnly && s.photos.length === 0) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        s.jaName.includes(q) ||
        s.scientificName.toLowerCase().includes(q) ||
        s.family.includes(q) ||
        s.order.includes(q) ||
        s.genus.includes(q)
      );
    }
    return true;
  });
}

/** 一覧画面のソート条件を適用する（元の配列は変更しない） */
export function sortSpecies<T extends FilterableSpecies>(
  species: T[],
  sort: string,
): T[] {
  const result = [...species];

  if (sort === 'name') {
    result.sort((a, b) => a.jaName.localeCompare(b.jaName, 'ja'));
  } else if (sort === 'category') {
    result.sort(
      (a, b) =>
        CATEGORIES.indexOf(a.category as Category) -
        CATEGORIES.indexOf(b.category as Category),
    );
  } else if (sort === 'status') {
    result.sort(
      (a, b) =>
        STATUSES.indexOf(a.status as Status) -
        STATUSES.indexOf(b.status as Status),
    );
  } else if (sort === 'hazardous') {
    result.sort((a, b) => Number(!!b.hazardous) - Number(!!a.hazardous));
  } else if (sort === 'photos') {
    result.sort(
      (a, b) => Number(b.photos.length > 0) - Number(a.photos.length > 0),
    );
  }

  return result;
}

export function filterAndSortSpecies<T extends FilterableSpecies>(
  species: T[],
  filters: SpeciesFilters & { sort?: string },
): T[] {
  return sortSpecies(filterSpecies(species, filters), filters.sort ?? '');
}

export interface Page<T> {
  visible: T[];
  hasMore: boolean;
}

/** 先頭から visibleCount 件を切り出し、まだ続きがあるかどうかを返す */
export function paginate<T>(items: T[], visibleCount: number): Page<T> {
  return {
    visible: items.slice(0, visibleCount),
    hasMore: visibleCount < items.length,
  };
}

export interface PrefectureAggregation {
  /** その都道府県に該当する種の数（定着状況が未知の値でもカウントする） */
  count: number;
  /** STATUS_PRIORITY の順で最も懸念度が高い定着状況（該当種が無ければ undefined） */
  dominantStatus?: Status;
}

/**
 * 都道府県ごとに、該当する種の数と最も懸念度が高い定着状況を集計する。
 * 一覧画面の地図フィルタで、都道府県を定着状況の色で塗り分けるために使う。
 */
export function aggregatePrefectureStatus<
  T extends { status: string; prefectures: string[] },
>(
  species: T[],
  prefectures: readonly string[],
): Record<string, PrefectureAggregation> {
  const knownStatuses: readonly string[] = STATUSES;
  const result: Record<string, PrefectureAggregation> = {};
  const statusesByPrefecture = new Map<string, Set<Status>>();
  for (const p of prefectures) {
    result[p] = { count: 0 };
    statusesByPrefecture.set(p, new Set());
  }

  for (const s of species) {
    const status = knownStatuses.includes(s.status)
      ? (s.status as Status)
      : undefined;
    for (const pref of s.prefectures) {
      const agg = result[pref];
      if (!agg) continue;
      agg.count += 1;
      if (status) statusesByPrefecture.get(pref)?.add(status);
    }
  }

  for (const p of prefectures) {
    const statuses = statusesByPrefecture.get(p);
    if (!statuses) continue;
    result[p].dominantStatus = STATUS_PRIORITY.find((st) => statuses.has(st));
  }

  return result;
}

import { CATEGORIES, type Category, STATUSES, type Status } from './types';

export interface SpeciesFilters {
  query?: string;
  category?: string;
  conditional?: 'all' | 'yes' | 'no';
  status?: string;
  prefecture?: string;
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
}

/** 一覧画面のフィルタ条件（カテゴリ・条件付き・定着状況・都道府県・検索語）を適用する */
export function filterSpecies<T extends FilterableSpecies>(
  species: T[],
  filters: SpeciesFilters,
): T[] {
  const { query, category, conditional, status, prefecture } = filters;

  return species.filter((s) => {
    if (category && s.category !== category) return false;
    if (conditional === 'yes' && !s.isConditional) return false;
    if (conditional === 'no' && s.isConditional) return false;
    if (status && s.status !== status) return false;
    if (prefecture && !s.prefectures.includes(prefecture)) return false;
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

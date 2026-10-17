'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CONDITIONAL_FILTERS,
  type ConditionalFilter,
} from '@/lib/species-filter';

/** 一覧画面のフィルタ・検索・ソート条件（URLクエリパラメータから復元した値） */
export interface SpeciesListFilters {
  query: string;
  category: string;
  conditional: ConditionalFilter;
  status: string;
  prefecture: string;
  sort: string;
  favoriteOnly: boolean;
  hazardousOnly: boolean;
  photoOnly: boolean;
}

/** setFilterで変更できる条件。検索語はデバウンスするため setInputQuery 経由で変更する */
export type EditableFilterKey = Exclude<keyof SpeciesListFilters, 'query'>;

export type SetFilter = <K extends EditableFilterKey>(
  key: K,
  value: SpeciesListFilters[K],
) => void;

export interface SpeciesListParams {
  filters: SpeciesListFilters;
  inputQuery: string;
  setInputQuery: (value: string) => void;
  setFilter: SetFilter;
}

/** 各条件に対応するURLクエリパラメータ名 */
const PARAM_KEYS: Record<keyof SpeciesListFilters, string> = {
  query: 'q',
  category: 'category',
  conditional: 'conditional',
  status: 'status',
  prefecture: 'prefecture',
  sort: 'sort',
  favoriteOnly: 'favorite',
  hazardousOnly: 'hazardous',
  photoOnly: 'photo',
};

function parseConditional(value: string | null): ConditionalFilter {
  return CONDITIONAL_FILTERS.find((c) => c === value) ?? 'all';
}

export function parseFilters(
  searchParams: URLSearchParams,
): SpeciesListFilters {
  const str = (key: keyof SpeciesListFilters) =>
    searchParams.get(PARAM_KEYS[key]) ?? '';
  const flag = (key: keyof SpeciesListFilters) =>
    searchParams.get(PARAM_KEYS[key]) === '1';

  return {
    query: str('query'),
    category: str('category'),
    conditional: parseConditional(searchParams.get(PARAM_KEYS.conditional)),
    status: str('status'),
    prefecture: str('prefecture'),
    sort: str('sort'),
    favoriteOnly: flag('favoriteOnly'),
    hazardousOnly: flag('hazardousOnly'),
    photoOnly: flag('photoOnly'),
  };
}

/** 条件の値をURLクエリパラメータの値に変換する。空文字はパラメータ削除を意味する */
export function toParamValue(value: string | boolean): string {
  if (typeof value === 'boolean') return value ? '1' : '';
  return value === 'all' ? '' : value;
}

/**
 * 一覧画面のフィルタ・検索・ソート条件をURLクエリパラメータと同期させるフック。
 * 検索語（q）だけは入力のたびにURLへ反映すると重いため、300ms デバウンスして反映する。
 */
export function useSpeciesListParams(): SpeciesListParams {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // searchParamsはURLが変わらない限り同一参照のため、filtersも同一参照に保たれる
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [inputQuery, setInputQuery] = useState(filters.query);

  const setParam = useCallback(
    (key: keyof SpeciesListFilters, value: string | boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      const paramValue = toParamValue(value);
      if (paramValue) {
        params.set(PARAM_KEYS[key], paramValue);
      } else {
        params.delete(PARAM_KEYS[key]);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setParamRef = useRef(setParam);
  setParamRef.current = setParam;

  useEffect(() => {
    const timer = setTimeout(() => {
      setParamRef.current('query', inputQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  return {
    filters,
    inputQuery,
    setInputQuery,
    setFilter: setParam,
  };
}

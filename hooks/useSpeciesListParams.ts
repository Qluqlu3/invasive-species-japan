'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpeciesListParams {
  query: string;
  inputQuery: string;
  setInputQuery: (value: string) => void;
  category: string;
  conditional: 'all' | 'yes' | 'no';
  status: string;
  prefecture: string;
  sort: string;
  setParam: (key: string, value: string) => void;
}

/**
 * 一覧画面のフィルタ・検索・ソート条件をURLクエリパラメータと同期させるフック。
 * 検索語（q）だけは入力のたびにURLへ反映すると重いため、300ms デバウンスして反映する。
 */
export function useSpeciesListParams(): SpeciesListParams {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const [inputQuery, setInputQuery] = useState(query);

  const category = searchParams.get('category') ?? '';
  const conditional = (searchParams.get('conditional') ?? 'all') as
    | 'all'
    | 'yes'
    | 'no';
  const status = searchParams.get('status') ?? '';
  const prefecture = searchParams.get('prefecture') ?? '';
  const sort = searchParams.get('sort') ?? '';

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
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
      setParamRef.current('q', inputQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  return {
    query,
    inputQuery,
    setInputQuery,
    category,
    conditional,
    status,
    prefecture,
    sort,
    setParam,
  };
}

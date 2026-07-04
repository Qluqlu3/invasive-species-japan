'use client';

import { Box, Grid, Text } from '@chakra-ui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CATEGORIES,
  type Category,
  type Species,
  STATUSES,
  type Status,
} from '@/lib/types';
import SpeciesCard from './SpeciesCard';
import SpeciesFilterBar from './SpeciesFilterBar';

const PAGE_SIZE = 48;

interface Props {
  species: Species[];
}

export default function SpeciesList({ species }: Props) {
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

  const filtered = useMemo(() => {
    const result = species.filter((s) => {
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
  }, [species, query, category, conditional, status, prefecture, sort]);

  const totalCount = filtered.length;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset visible count whenever the filtered set changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category, conditional, status, prefecture, sort]);

  const paginated = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < totalCount;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, totalCount));
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, totalCount]);

  return (
    <Box>
      <SpeciesFilterBar
        query={inputQuery}
        category={category}
        conditional={conditional}
        status={status}
        prefecture={prefecture}
        sort={sort}
        count={totalCount}
        onQueryChange={(v) => setInputQuery(v)}
        onCategoryChange={(v) => setParam('category', v)}
        onConditionalChange={(v) => setParam('conditional', v)}
        onStatusChange={(v) => setParam('status', v)}
        onPrefectureChange={(v) => setParam('prefecture', v)}
        onSortChange={(v) => setParam('sort', v)}
      />
      <Grid
        templateColumns={{
          base: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(4, 1fr)',
          lg: 'repeat(5, 1fr)',
          xl: 'repeat(6, 1fr)',
        }}
        gap={4}
        p={4}
      >
        {paginated.map((s) => (
          <SpeciesCard key={s.id} species={s} />
        ))}
      </Grid>
      {totalCount === 0 && (
        <Text textAlign="center" py={20} color="gray.600">
          該当する種が見つかりません
        </Text>
      )}
      {hasMore && <Box ref={sentinelRef} h={1} />}
    </Box>
  );
}

'use client';

import { Box, Button, Flex, Grid, Text } from '@chakra-ui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
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
  const category = searchParams.get('category') ?? '';
  const conditional = (searchParams.get('conditional') ?? 'all') as
    | 'all'
    | 'yes'
    | 'no';
  const status = searchParams.get('status') ?? '';
  const prefecture = searchParams.get('prefecture') ?? '';
  const sort = searchParams.get('sort') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // フィルター・ソート変更時はページを先頭にリセット
      if (key !== 'page') {
        params.delete('page');
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const { paginated, totalPages, totalCount } = useMemo(() => {
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

    const totalCount = result.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const clampedPage = Math.min(page, totalPages);
    const paginated = result.slice(
      (clampedPage - 1) * PAGE_SIZE,
      clampedPage * PAGE_SIZE,
    );

    return { paginated, totalPages, totalCount };
  }, [species, query, category, conditional, status, prefecture, sort, page]);

  return (
    <Box>
      <SpeciesFilterBar
        query={query}
        category={category}
        conditional={conditional}
        status={status}
        prefecture={prefecture}
        sort={sort}
        count={totalCount}
        onQueryChange={(v) => setParam('q', v)}
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
        <Text textAlign="center" py={20} color="gray.400">
          該当する種が見つかりません
        </Text>
      )}
      {totalPages > 1 && (
        <Flex justify="center" align="center" gap={3} py={6}>
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setParam('page', String(page - 1))}
          >
            ← 前へ
          </Button>
          <Text fontSize="sm" color="gray.600">
            {page} / {totalPages} ページ
          </Text>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setParam('page', String(page + 1))}
          >
            次へ →
          </Button>
        </Flex>
      )}
    </Box>
  );
}

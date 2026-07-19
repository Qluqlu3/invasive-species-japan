'use client';

import { Box, Grid, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useSpeciesListParams } from '@/hooks/useSpeciesListParams';
import { filterAndSortSpecies, paginate } from '@/lib/species-filter';
import type { SpeciesListItem } from '@/lib/types';
import SpeciesCard from './SpeciesCard';
import SpeciesFilterBar from './SpeciesFilterBar';

const PAGE_SIZE = 48;

interface Props {
  species: SpeciesListItem[];
}

export default function SpeciesList({ species }: Props) {
  const {
    query,
    inputQuery,
    setInputQuery,
    category,
    conditional,
    status,
    prefecture,
    sort,
    setParam,
  } = useSpeciesListParams();

  const filtered = useMemo(
    () =>
      filterAndSortSpecies(species, {
        query,
        category,
        conditional,
        status,
        prefecture,
        sort,
      }),
    [species, query, category, conditional, status, prefecture, sort],
  );

  const totalCount = filtered.length;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset visible count whenever the filtered set changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category, conditional, status, prefecture, sort]);

  const { visible: paginated, hasMore } = paginate(filtered, visibleCount);

  const sentinelRef = useInfiniteScroll(hasMore, () =>
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, totalCount)),
  );

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

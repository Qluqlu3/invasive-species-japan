'use client';

import { Box, Grid, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useSpeciesListParams } from '@/hooks/useSpeciesListParams';
import {
  filterAndSortSpecies,
  filterSpecies,
  paginate,
} from '@/lib/species-filter';
import type { SpeciesListItem } from '@/lib/types';
import RecentlyViewedShelf from './RecentlyViewedShelf';
import SpeciesCard from './SpeciesCard';
import SpeciesFilterBar from './SpeciesFilterBar';
import SpeciesMapFilter from './SpeciesMapFilter';

const PAGE_SIZE = 48;

interface Props {
  species: SpeciesListItem[];
}

export default function SpeciesList({ species }: Props) {
  const { filters, inputQuery, setInputQuery, setFilter } =
    useSpeciesListParams();

  const { favorites, toggleFavorite } = useFavorites();
  const { recentlyViewed } = useRecentlyViewed();

  const recentlyViewedSpecies = useMemo(() => {
    const byId = new Map(species.map((s) => [s.id, s]));
    return recentlyViewed
      .map((id) => byId.get(id))
      .filter((s): s is SpeciesListItem => !!s);
  }, [species, recentlyViewed]);

  const filtered = useMemo(() => {
    const base = filterAndSortSpecies(species, filters);
    return filters.favoriteOnly
      ? base.filter((s) => favorites.has(s.id))
      : base;
  }, [species, filters, favorites]);

  // 都道府県以外の条件のみを適用したリスト。地図フィルタ上で都道府県を選択中でも
  // 他の都道府県の状況を確認・切り替えできるようにするため、prefectureは含めない。
  const { query, category, conditional, status } = filters;
  const mapSpecies = useMemo(
    () => filterSpecies(species, { query, category, conditional, status }),
    [species, query, category, conditional, status],
  );

  const totalCount = filtered.length;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset visible count whenever the filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  const { visible: paginated, hasMore } = paginate(filtered, visibleCount);

  const sentinelRef = useInfiniteScroll(hasMore, () =>
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, totalCount)),
  );

  return (
    <Box>
      <RecentlyViewedShelf species={recentlyViewedSpecies} />
      <SpeciesFilterBar
        filters={filters}
        query={inputQuery}
        count={totalCount}
        onQueryChange={setInputQuery}
        onFilterChange={setFilter}
      />
      <SpeciesMapFilter
        species={mapSpecies}
        selectedPrefecture={filters.prefecture}
        onSelectPrefecture={(v) => setFilter('prefecture', v)}
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
          <SpeciesCard
            key={s.id}
            species={s}
            isFavorite={favorites.has(s.id)}
            onToggleFavorite={toggleFavorite}
          />
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

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
  const {
    query,
    inputQuery,
    setInputQuery,
    category,
    conditional,
    status,
    prefecture,
    sort,
    favoriteOnly,
    hazardousOnly,
    photoOnly,
    setParam,
  } = useSpeciesListParams();

  const { favorites, toggleFavorite } = useFavorites();
  const { recentlyViewed } = useRecentlyViewed();

  const recentlyViewedSpecies = useMemo(() => {
    const byId = new Map(species.map((s) => [s.id, s]));
    return recentlyViewed
      .map((id) => byId.get(id))
      .filter((s): s is SpeciesListItem => !!s);
  }, [species, recentlyViewed]);

  const filtered = useMemo(() => {
    const base = filterAndSortSpecies(species, {
      query,
      category,
      conditional,
      status,
      prefecture,
      hazardousOnly,
      photoOnly,
      sort,
    });
    return favoriteOnly ? base.filter((s) => favorites.has(s.id)) : base;
  }, [
    species,
    query,
    category,
    conditional,
    status,
    prefecture,
    hazardousOnly,
    photoOnly,
    sort,
    favoriteOnly,
    favorites,
  ]);

  // 都道府県以外の条件のみを適用したリスト。地図フィルタ上で都道府県を選択中でも
  // 他の都道府県の状況を確認・切り替えできるようにするため、prefectureは含めない。
  const mapSpecies = useMemo(
    () => filterSpecies(species, { query, category, conditional, status }),
    [species, query, category, conditional, status],
  );

  const totalCount = filtered.length;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset visible count whenever the filtered set changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    query,
    category,
    conditional,
    status,
    prefecture,
    hazardousOnly,
    photoOnly,
    sort,
    favoriteOnly,
  ]);

  const { visible: paginated, hasMore } = paginate(filtered, visibleCount);

  const sentinelRef = useInfiniteScroll(hasMore, () =>
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, totalCount)),
  );

  return (
    <Box>
      <RecentlyViewedShelf species={recentlyViewedSpecies} />
      <SpeciesFilterBar
        query={inputQuery}
        category={category}
        conditional={conditional}
        status={status}
        prefecture={prefecture}
        sort={sort}
        favoriteOnly={favoriteOnly}
        hazardousOnly={hazardousOnly}
        photoOnly={photoOnly}
        count={totalCount}
        onQueryChange={(v) => setInputQuery(v)}
        onCategoryChange={(v) => setParam('category', v)}
        onConditionalChange={(v) => setParam('conditional', v)}
        onStatusChange={(v) => setParam('status', v)}
        onPrefectureChange={(v) => setParam('prefecture', v)}
        onSortChange={(v) => setParam('sort', v)}
        onFavoriteOnlyChange={(v) => setParam('favorite', v ? '1' : '')}
        onHazardousOnlyChange={(v) => setParam('hazardous', v ? '1' : '')}
        onPhotoOnlyChange={(v) => setParam('photo', v ? '1' : '')}
      />
      <SpeciesMapFilter
        species={mapSpecies}
        selectedPrefecture={prefecture}
        onSelectPrefecture={(v) => setParam('prefecture', v)}
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

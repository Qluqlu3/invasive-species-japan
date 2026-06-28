'use client';

import { Box, Grid, Text } from '@chakra-ui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { Species } from '@/lib/types';
import SpeciesCard from './SpeciesCard';
import SpeciesFilterBar from './SpeciesFilterBar';

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

  const filtered = useMemo(() => {
    return species.filter((s) => {
      if (category && s.category !== category) return false;
      if (conditional === 'yes' && !s.isConditional) return false;
      if (conditional === 'no' && s.isConditional) return false;
      if (status && s.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          s.jaName.includes(q) ||
          s.scientificName.toLowerCase().includes(q) ||
          s.family.includes(q) ||
          s.order.includes(q)
        );
      }
      return true;
    });
  }, [species, query, category, conditional, status]);

  return (
    <Box>
      <SpeciesFilterBar
        query={query}
        category={category}
        conditional={conditional}
        status={status}
        count={filtered.length}
        onQueryChange={(v) => setParam('q', v)}
        onCategoryChange={(v) => setParam('category', v)}
        onConditionalChange={(v) => setParam('conditional', v)}
        onStatusChange={(v) => setParam('status', v)}
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
        {filtered.map((s) => (
          <SpeciesCard key={s.id} species={s} />
        ))}
      </Grid>
      {filtered.length === 0 && (
        <Text textAlign="center" py={20} color="gray.400">
          該当する種が見つかりません
        </Text>
      )}
    </Box>
  );
}

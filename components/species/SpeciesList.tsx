'use client';

import { useMemo, useState } from 'react';
import type { Species } from '@/lib/types';
import SpeciesCard from './SpeciesCard';
import SpeciesFilterBar from './SpeciesFilterBar';

interface Props {
  species: Species[];
}

export default function SpeciesList({ species }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [conditional, setConditional] = useState<'all' | 'yes' | 'no'>('all');

  const filtered = useMemo(() => {
    return species.filter((s) => {
      if (category && s.category !== category) return false;
      if (conditional === 'yes' && !s.isConditional) return false;
      if (conditional === 'no' && s.isConditional) return false;
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
  }, [species, query, category, conditional]);

  return (
    <div>
      <SpeciesFilterBar
        query={query}
        category={category}
        conditional={conditional}
        count={filtered.length}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
        onConditionalChange={setConditional}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {filtered.map((s) => (
          <SpeciesCard key={s.id} species={s} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          該当する種が見つかりません
        </div>
      )}
    </div>
  );
}

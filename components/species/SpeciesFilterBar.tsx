'use client';

import { CATEGORIES } from '@/lib/types';

interface Props {
  query: string;
  category: string;
  conditional: 'all' | 'yes' | 'no';
  count: number;
  onQueryChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onConditionalChange: (v: 'all' | 'yes' | 'no') => void;
}

const selectClass =
  'border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500';

export default function SpeciesFilterBar({
  query,
  category,
  conditional,
  count,
  onQueryChange,
  onCategoryChange,
  onConditionalChange,
}: Props) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center">
      <input
        type="search"
        placeholder="和名・学名・科・目で検索"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={selectClass}
      >
        <option value="">すべての分類群</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={conditional}
        onChange={(e) =>
          onConditionalChange(e.target.value as 'all' | 'yes' | 'no')
        }
        className={selectClass}
      >
        <option value="all">条件付き: すべて</option>
        <option value="no">特定外来生物のみ</option>
        <option value="yes">条件付特定外来生物のみ</option>
      </select>
      <span className="text-sm text-gray-500 ml-auto">{count} 件</span>
    </div>
  );
}

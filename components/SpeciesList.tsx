'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Species } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

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
      {/* フィルタバー */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="和名・学名・科・目で検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
          onChange={(e) => setConditional(e.target.value as typeof conditional)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">条件付き: すべて</option>
          <option value="no">特定外来生物のみ</option>
          <option value="yes">条件付特定外来生物のみ</option>
        </select>
        <span className="text-sm text-gray-500 ml-auto">
          {filtered.length} 件
        </span>
      </div>

      {/* グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {filtered.map((s) => (
          <Link
            key={s.id}
            href={`/species/${s.id}`}
            className="group rounded-xl overflow-hidden border border-gray-200 hover:border-green-400 hover:shadow-md transition-all bg-white"
          >
            <div className="relative aspect-square bg-gray-100">
              {s.photos[0] ? (
                <Image
                  src={s.photos[0]}
                  alt={s.jaName}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300 text-3xl">
                  ?
                </div>
              )}
              {s.isConditional && (
                <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] px-1 rounded">
                  条件付
                </span>
              )}
            </div>
            <div className="p-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {s.jaName}
              </p>
              <p className="text-[11px] text-gray-400 truncate italic">
                {s.scientificName}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{s.category}</p>
            </div>
          </Link>
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

import Image from 'next/image';
import Link from 'next/link';
import type { Species } from '@/lib/types';

interface Props {
  species: Species;
}

export default function SpeciesCard({ species: s }: Props) {
  return (
    <Link
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
        <p className="text-sm font-medium text-gray-900 truncate">{s.jaName}</p>
        <p className="text-[11px] text-gray-400 truncate italic">
          {s.scientificName}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">{s.category}</p>
      </div>
    </Link>
  );
}

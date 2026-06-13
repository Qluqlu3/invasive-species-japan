'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  photos: string[];
  name: string;
}

export default function PhotoGallery({ photos, name }: Props) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-2">
      {/* メイン画像 */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={photos[selected]}
          alt={name}
          fill
          sizes="(max-width: 896px) 100vw, 896px"
          className="object-contain"
          priority
        />
      </div>

      {/* サムネイル（複数枚のときのみ表示） */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selected
                  ? 'border-green-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={url}
                alt={`${name} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

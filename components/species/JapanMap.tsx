'use client';

import { useMemo, useRef, useState } from 'react';
import prefecturePaths from '@/data/prefecture-paths.json';

interface Props {
  highlightedPrefectures: string[];
  onPrefectureClick?: (prefecture: string) => void;
}

const PATHS = prefecturePaths as Record<string, string>;
const FOUND = '#16a34a';
const FOUND_HOVER = '#15803d';
const EMPTY = '#e5e7eb';
const EMPTY_HOVER = '#d1d5db';

export default function JapanMap({
  highlightedPrefectures,
  onPrefectureClick,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const foundSet = useMemo(
    () => new Set(highlightedPrefectures),
    [highlightedPrefectures],
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const isFound = (name: string) => foundSet.has(name);

  return (
    <div ref={containerRef} style={{ position: 'relative', lineHeight: 0 }}>
      <svg
        viewBox="0 0 900 800"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
        role="img"
        aria-label="日本地図 — 種の分布"
      >
        {Object.entries(PATHS).map(([name, d]) => {
          const found = isFound(name);
          const hov = hovered === name;
          return (
            <path
              key={name}
              d={d}
              fill={
                found ? (hov ? FOUND_HOVER : FOUND) : hov ? EMPTY_HOVER : EMPTY
              }
              stroke="white"
              strokeWidth={0.8}
              strokeLinejoin="round"
              aria-label={name}
              onMouseEnter={() => setHovered(name)}
              onClick={() => onPrefectureClick?.(name)}
              style={{
                cursor: onPrefectureClick ? 'pointer' : 'default',
                transition: 'fill 80ms',
              }}
            />
          );
        })}
      </svg>

      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(
              mouse.x + 14,
              (containerRef.current?.offsetWidth ?? 0) - 130,
            ),
            top: Math.max(4, mouse.y - 34),
            background: 'rgba(15,15,15,0.88)',
            color: 'white',
            padding: '5px 12px',
            borderRadius: 7,
            fontSize: 13,
            fontWeight: 500,
            lineHeight: '1.4',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: isFound(hovered) ? FOUND : '#9ca3af',
              flexShrink: 0,
            }}
          />
          <span>{hovered}</span>
          {isFound(hovered) && (
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
              生息確認
            </span>
          )}
        </div>
      )}
    </div>
  );
}

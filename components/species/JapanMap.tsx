'use client';

import { useMemo, useRef, useState } from 'react';
import prefecturePaths from '@/data/prefecture-paths.json';

interface Props {
  /** 単一種の分布表示用（二値: 生息確認あり/なし）。prefectureColors指定時は無視される */
  highlightedPrefectures?: string[];
  /** 複数色での塗り分け用（都道府県名 → 色）。一覧画面の地図フィルタ等で使用 */
  prefectureColors?: Record<string, string>;
  /** 現在選択中の都道府県（枠線で強調表示する） */
  selectedPrefecture?: string | null;
  /** ホバー時にツールチップへ表示する補足テキスト（都道府県名 → テキスト） */
  hoverLabels?: Record<string, string>;
  onPrefectureClick?: (prefecture: string) => void;
}

const PATHS = prefecturePaths as Record<string, string>;
const FOUND = '#16a34a';
const EMPTY = '#e5e7eb';
const SELECTED_STROKE = '#111827';

export default function JapanMap({
  highlightedPrefectures,
  prefectureColors,
  selectedPrefecture,
  hoverLabels,
  onPrefectureClick,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const foundSet = useMemo(
    () => new Set(highlightedPrefectures ?? []),
    [highlightedPrefectures],
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const getColor = (name: string) => {
    if (prefectureColors) return prefectureColors[name] ?? EMPTY;
    return foundSet.has(name) ? FOUND : EMPTY;
  };

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
          const hov = hovered === name;
          const selected = selectedPrefecture === name;
          return (
            <path
              key={name}
              d={d}
              fill={getColor(name)}
              stroke={selected ? SELECTED_STROKE : 'white'}
              strokeWidth={selected ? 2.2 : 0.8}
              strokeLinejoin="round"
              aria-label={name}
              onMouseEnter={() => setHovered(name)}
              onClick={() => onPrefectureClick?.(name)}
              style={{
                cursor: onPrefectureClick ? 'pointer' : 'default',
                filter: hov ? 'brightness(0.88)' : undefined,
                transition: 'fill 80ms, filter 80ms',
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
              background: getColor(hovered),
              flexShrink: 0,
            }}
          />
          <span>{hovered}</span>
          {(hoverLabels?.[hovered] ??
            (!prefectureColors && foundSet.has(hovered)
              ? '生息確認'
              : undefined)) && (
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
              {hoverLabels?.[hovered] ?? '生息確認'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

import { ImageResponse } from 'next/og';
import { getAllSpecies, getSpeciesById } from '@/lib/data';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getAllSpecies().map((s) => ({ id: s.id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = getSpeciesById(id);

  if (!s) {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#111',
        }}
      />,
      size,
    );
  }

  const bg = s.isConditional ? '#9A3412' : '#166534';
  const badgeText = s.isConditional ? '条件付特定外来生物' : '特定外来生物';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bg,
        padding: '60px 80px',
        justifyContent: 'space-between',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          color: 'rgba(255,255,255,0.55)',
          fontSize: 26,
          letterSpacing: 2,
        }}
      >
        日本の特定外来生物
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            color: 'white',
            fontSize: s.jaName.length > 10 ? 72 : 96,
            fontWeight: 'bold',
            lineHeight: 1.1,
          }}
        >
          {s.jaName}
        </div>
        <div
          style={{
            display: 'flex',
            color: 'rgba(255,255,255,0.65)',
            fontSize: 34,
            fontStyle: 'italic',
          }}
        >
          {s.scientificName}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '8px 24px',
            borderRadius: 100,
            fontSize: 22,
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {s.category}
        </div>
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '8px 24px',
            borderRadius: 100,
            fontSize: 22,
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {badgeText}
        </div>
      </div>
    </div>,
    size,
  );
}

import { ImageResponse } from 'next/og';
import { getAllSpecies } from '@/lib/data';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = '日本の特定外来生物';

export default function Image() {
  const count = getAllSpecies().length;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#166534',
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
        invasive.jp
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            color: 'white',
            fontSize: 80,
            fontWeight: 'bold',
            lineHeight: 1.15,
          }}
        >
          日本の特定外来生物
        </div>
        <div
          style={{
            display: 'flex',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 36,
          }}
        >
          環境省指定 {count} 種の外来生物を検索・閲覧
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '8px 28px',
            borderRadius: 100,
            fontSize: 24,
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          特定外来生物・条件付特定外来生物
        </div>
      </div>
    </div>,
    size,
  );
}

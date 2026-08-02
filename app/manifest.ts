import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '日本の特定外来生物ビューア',
    short_name: '特定外来生物',
    description:
      '環境省指定の特定外来生物・条件付特定外来生物を一覧・検索できるビューア',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f4f6',
    theme_color: '#166534',
    lang: 'ja',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import PhotoGallery from '@/components/PhotoGallery';
import { getAllSpecies, getSpeciesById } from '@/lib/data';
import { ALL_PREFECTURES } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getAllSpecies().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const s = getSpeciesById(id);
  if (!s) return {};
  return { title: `${s.jaName} | 日本の特定外来生物` };
}

export default async function SpeciesPage({ params }: Props) {
  const { id } = await params;
  const s = getSpeciesById(id);
  if (!s) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-green-700 text-white px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-green-200 hover:text-white text-sm">
          ← 一覧に戻る
        </Link>
        <div>
          <h1 className="text-xl font-bold">{s.jaName}</h1>
          <p className="text-green-200 text-sm italic">{s.scientificName}</p>
        </div>
        {s.isConditional && (
          <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-1 rounded">
            条件付特定外来生物
          </span>
        )}
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 写真ギャラリー */}
        {s.photos.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              写真
            </h2>
            <PhotoGallery photos={s.photos} name={s.jaName} />
          </section>
        )}

        {/* 基本情報 */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 border-b border-gray-100">
            基本情報
          </h2>
          <dl className="divide-y divide-gray-100">
            {[
              ['分類群', s.category],
              ['目', s.order],
              ['科', s.family],
              ['属', s.genus],
              ['定着状況', s.status],
            ].map(([label, value]) => (
              <div key={label} className="flex px-5 py-3 gap-4">
                <dt className="w-24 text-sm text-gray-500 shrink-0">{label}</dt>
                <dd className="text-sm text-gray-900">{value || '—'}</dd>
              </div>
            ))}
            {s.niesUrl && (
              <div className="flex px-5 py-3 gap-4">
                <dt className="w-24 text-sm text-gray-500 shrink-0">
                  NIESリンク
                </dt>
                <dd className="text-sm">
                  <a
                    href={s.niesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline"
                  >
                    NIES詳細ページ ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* 分布都道府県 */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 border-b border-gray-100">
            国内分布 ({s.prefectures.length} 都道府県)
          </h2>
          {s.prefectures.length > 0 ? (
            <div className="px-5 py-4 flex flex-wrap gap-2">
              {ALL_PREFECTURES.filter((p) => s.prefectures.includes(p)).map(
                (p) => (
                  <span
                    key={p}
                    className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full"
                  >
                    {p}
                  </span>
                ),
              )}
            </div>
          ) : (
            <p className="px-5 py-4 text-sm text-gray-400">分布データなし</p>
          )}
        </section>
      </div>
    </main>
  );
}

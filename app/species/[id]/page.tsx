import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import PhotoGallery from '@/components/species/PhotoGallery';
import PrefectureList from '@/components/species/PrefectureList';
import SpeciesInfoTable from '@/components/species/SpeciesInfoTable';
import { getAllSpecies, getSpeciesById } from '@/lib/data';

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
      <PageHeader
        title={s.jaName}
        subtitle={s.scientificName}
        backHref="/"
        backLabel="← 一覧に戻る"
        badge={s.isConditional ? '条件付特定外来生物' : undefined}
      />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {s.photos.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              写真
            </h2>
            <PhotoGallery photos={s.photos} name={s.jaName} />
          </section>
        )}
        <SpeciesInfoTable species={s} />
        <PrefectureList prefectures={s.prefectures} />
      </div>
    </main>
  );
}

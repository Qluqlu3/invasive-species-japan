import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import DescriptionSection from '@/components/species/DescriptionSection';
import DesignationBadge from '@/components/species/DesignationBadge';
import PhotoGallery from '@/components/species/PhotoGallery';
import PrefectureList from '@/components/species/PrefectureList';
import SpeciesInfoTable from '@/components/species/SpeciesInfoTable';
import { getAllSpecies, getSpeciesById } from '@/lib/data';
import { isHazardous } from '@/lib/description';

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
    <main>
      <PageHeader
        title={s.jaName}
        subtitle={s.scientificName}
        backHref="/"
        backLabel="← 一覧に戻る"
        badge={s.isConditional ? '条件付特定外来生物' : '特定外来生物'}
        badgeColorPalette={s.isConditional ? 'orange' : 'red'}
      />
      <div className="page-content">
        <DesignationBadge
          isConditional={s.isConditional}
          hazardous={isHazardous(s.description)}
        />
        {s.photos.length > 0 && (
          <section>
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              写真
            </h2>
            <PhotoGallery photos={s.photos} name={s.jaName} />
          </section>
        )}
        <SpeciesInfoTable species={s} />
        {s.description && <DescriptionSection description={s.description} />}
        <PrefectureList prefectures={s.prefectures} />
      </div>
    </main>
  );
}

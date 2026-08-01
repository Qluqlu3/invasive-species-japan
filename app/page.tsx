import { Suspense } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import SpeciesList from '@/components/species/SpeciesList';
import { getDataMeta, getSpeciesListItems } from '@/lib/data';
import { formatJaDate } from '@/lib/format';

export default function HomePage() {
  const species = getSpeciesListItems();
  const meta = getDataMeta();
  const subtitle = [
    `環境省指定 特定外来生物・条件付特定外来生物 ${species.length} 種`,
    meta ? `データ更新日: ${formatJaDate(meta.lastUpdated)}` : null,
  ]
    .filter(Boolean)
    .join(' ・ ');

  return (
    <main>
      <PageHeader title="日本の特定外来生物" subtitle={subtitle} />
      <Suspense fallback={null}>
        <SpeciesList species={species} />
      </Suspense>
    </main>
  );
}

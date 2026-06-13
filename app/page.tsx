import PageHeader from '@/components/layout/PageHeader';
import SpeciesList from '@/components/species/SpeciesList';
import { getAllSpecies } from '@/lib/data';

export default function HomePage() {
  const species = getAllSpecies();

  return (
    <main className="min-h-screen bg-gray-50">
      <PageHeader
        title="日本の特定外来生物"
        subtitle={`環境省指定 特定外来生物・条件付特定外来生物 ${species.length} 種`}
      />
      <SpeciesList species={species} />
    </main>
  );
}

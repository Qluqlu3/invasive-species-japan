import SpeciesList from '@/components/SpeciesList';
import { getAllSpecies } from '@/lib/data';

export default function HomePage() {
  const species = getAllSpecies();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">
          日本の特定外来生物
        </h1>
        <p className="text-green-200 text-sm mt-1">
          環境省指定 特定外来生物・条件付特定外来生物 {species.length} 種
        </p>
      </header>
      <SpeciesList species={species} />
    </main>
  );
}

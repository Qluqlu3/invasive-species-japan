import type { Species } from '@/lib/types';

interface Props {
  species: Species;
}

export default function SpeciesInfoTable({ species: s }: Props) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 border-b border-gray-100">
        基本情報
      </h2>
      <dl className="divide-y divide-gray-100">
        {(
          [
            ['分類群', s.category],
            ['目', s.order],
            ['科', s.family],
            ['属', s.genus],
            ['定着状況', s.status],
          ] as [string, string | undefined][]
        ).map(([label, value]) => (
          <div key={label} className="flex px-5 py-3 gap-4">
            <dt className="w-24 text-sm text-gray-500 shrink-0">{label}</dt>
            <dd className="text-sm text-gray-900">{value || '—'}</dd>
          </div>
        ))}
        {s.niesUrl && (
          <div className="flex px-5 py-3 gap-4">
            <dt className="w-24 text-sm text-gray-500 shrink-0">NIESリンク</dt>
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
  );
}

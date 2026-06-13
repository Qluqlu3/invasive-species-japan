import { ALL_PREFECTURES } from '@/lib/types';

interface Props {
  prefectures: string[];
}

export default function PrefectureList({ prefectures }: Props) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 border-b border-gray-100">
        国内分布 ({prefectures.length} 都道府県)
      </h2>
      {prefectures.length > 0 ? (
        <div className="px-5 py-4 flex flex-wrap gap-2">
          {ALL_PREFECTURES.filter((p) => prefectures.includes(p)).map((p) => (
            <span
              key={p}
              className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full"
            >
              {p}
            </span>
          ))}
        </div>
      ) : (
        <p className="px-5 py-4 text-sm text-gray-400">分布データなし</p>
      )}
    </section>
  );
}

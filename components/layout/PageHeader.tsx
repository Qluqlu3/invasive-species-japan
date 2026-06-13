import Link from 'next/link';

interface Props {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  badge?: string;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  badge,
}: Props) {
  return (
    <header className="bg-green-700 text-white px-6 py-4 flex items-center gap-4">
      {backHref && (
        <Link
          href={backHref}
          className="text-green-200 hover:text-white text-sm shrink-0"
        >
          {backLabel ?? '← 戻る'}
        </Link>
      )}
      <div className={backHref ? '' : 'py-1'}>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-green-200 text-sm mt-1">{subtitle}</p>}
      </div>
      {badge && (
        <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-1 rounded shrink-0">
          {badge}
        </span>
      )}
    </header>
  );
}

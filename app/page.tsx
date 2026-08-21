import Link from 'next/link';

// Deliberately plain. This page is a directory, not a design exercise —
// the routes below are yours to build.
const ROUTES = [
  { href: '/campaigns', label: '/campaigns', who: 'Track A', what: 'Campaign list and builder' },
  { href: '/give/legal-defense-fund', label: '/give/[slug]', who: 'Track A', what: 'Public donate page' },
  { href: '/dashboard', label: '/dashboard', who: 'Track B', what: 'Overview and reporting' },
  { href: '/dashboard/donors', label: '/dashboard/donors', who: 'Track B', what: 'Donor list' },
  { href: '/dashboard/assistant', label: '/dashboard/assistant', who: 'Track B', what: 'AI agent' },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Crescent take-home</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Read <code className="rounded bg-zinc-200 px-1">README.md</code>, then your
        track&apos;s brief. Nothing below is built yet.
      </p>

      <ul className="mt-8 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {ROUTES.map((r) => (
          <li key={r.href} className="flex items-center gap-4 px-4 py-3">
            <span className="w-16 shrink-0 text-xs font-medium text-zinc-500">{r.who}</span>
            <div className="min-w-0 flex-1">
              <Link href={r.href} className="font-mono text-sm text-violet-700 hover:underline">
                {r.label}
              </Link>
              <p className="truncate text-xs text-zinc-500">{r.what}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs text-zinc-500">
        Convex not connected? Run <code className="rounded bg-zinc-200 px-1">npx convex dev</code>{' '}
        in a second terminal, then{' '}
        <code className="rounded bg-zinc-200 px-1">npx convex run seed:run</code>.
      </p>
    </main>
  );
}
